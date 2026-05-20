import OfferLetter from "../models/OfferLetter.js";
import Template from "../models/Template.js";
import Application from "../models/Application.js";
import Company from "../models/Company.js";
import User from "../models/user.js";
import Student from "../models/Student.js";
import Internship from "../models/Internship.js";
import emailService from "../services/emailService.js";
import { generateOfferLetterPDF } from "../services/pdfService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveOfferLetterContext = async (offerLetter) => {
  let studentUserId = offerLetter.student?._id || offerLetter.student || null;
  let studentName = offerLetter.student?.name || null;
  let studentEmail = offerLetter.student?.email || null;
  let companyId = offerLetter.company?._id || offerLetter.company || null;
  let companyName =
    offerLetter.company?.company_name ||
    offerLetter.company?.legal_name ||
    offerLetter.company?.name ||
    null;
  let position = offerLetter.internship?.title || null;

  if (!studentName || !studentEmail || !companyName || !position) {
    const application = await Application.findById(offerLetter.application)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "internship",
        populate: { path: "company" },
      });

    if (application) {
      studentUserId = studentUserId || application.student?.user?._id || null;
      studentName = studentName || application.student?.user?.name || null;
      studentEmail = studentEmail || application.student?.user?.email || null;
      companyId = companyId || application.internship?.company?._id || null;
      companyName =
        companyName ||
        application.internship?.company?.company_name ||
        application.internship?.company?.legal_name ||
        application.internship?.company?.name ||
        null;
      position = position || application.internship?.title || null;
    }
  }

  if (studentUserId && (!studentName || !studentEmail)) {
    const user = await User.findById(studentUserId).select("name email");
    if (user) {
      studentName = studentName || user.name;
      studentEmail = studentEmail || user.email;
    }
  }

  return {
    studentUserId: studentUserId ? String(studentUserId) : null,
    studentName: studentName || "Student",
    studentEmail: studentEmail || null,
    companyId: companyId ? String(companyId) : null,
    companyName: companyName || "Company",
    position: position || "Intern",
  };
};

// @desc    Generate offer letter from template
// @route   POST /api/offer-letters/generate
// @access  Private (Company/Coordinator/Admin)
export const generateOfferLetter = async (req, res) => {
  try {
    const { applicationId, templateId, customDetails } = req.body;

    // Validate required fields
    if (!applicationId || !customDetails) {
      return res.status(400).json({
        success: false,
        message: "Application ID and custom details are required",
      });
    }

    // Fetch application with relations
    const application = await Application.findById(applicationId)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate("internship")
      .populate({
        path: "internship",
        populate: { path: "company" },
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    let template = null;
    let content = "";

    // If template ID provided, use it; otherwise use default
    if (templateId) {
      template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }
      content = template.content;
    } else {
      // Use default template with basic content
      content = getDefaultOfferLetterTemplate();
    }

    const studentName = application.student?.user?.name || "Student";
    const studentUserId = application.student?.user?._id;
    const internshipId = application.internship?._id;
    const companyId = application.internship?.company?._id;
    const position = application.internship?.title || "Intern";
    const companyName =
      application.internship?.company?.company_name ||
      application.internship?.company?.legal_name ||
      application.internship?.company?.name ||
      "Company";

    if (!studentUserId) {
      return res.status(400).json({
        success: false,
        message: "Application student account is incomplete",
      });
    }
    if (!internshipId || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Application internship/company linkage is incomplete",
      });
    }

    // Replace variables in template
    content = replaceTemplateVariables(content, {
      STUDENT_NAME: studentName,
      COMPANY_NAME: companyName,
      POSITION: position,
      SALARY: customDetails.salary,
      DURATION: customDetails.duration,
      LOCATION: customDetails.location,
      START_DATE: new Date(customDetails.start_date).toLocaleDateString(),
      RESPONSIBILITIES: customDetails.responsibilities?.join("\n") || "",
      BENEFITS: customDetails.benefits?.join("\n") || "",
    });

    // Create expiry date (30 days from now)
    const defaultExpirationDays = 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + defaultExpirationDays);

    // Create offer letter record
    const offerLetter = await OfferLetter.create({
      application: applicationId,
      student: studentUserId,
      internship: internshipId,
      company: companyId,
      template: templateId || null,
      content,
      status: "generated",
      custom_details: customDetails,
      expiry_date: expiryDate,
      generated_by: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Offer letter generated successfully",
      data: offerLetter,
    });
  } catch (error) {
    console.error("Generate offer letter error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate offer letter",
    });
  }
};

// @desc    Generate offer letter directly (without existing applications)
// @route   POST /api/offer-letters/generate-direct
// @access  Private (Company)
export const generateDirectOfferLetter = async (req, res) => {
  try {
    const { studentName, studentEmail, position, customDetails } = req.body;

    if (!studentName || !studentEmail || !position || !customDetails) {
      return res.status(400).json({
        success: false,
        message:
          "Student name, student email, position, and custom details are required",
      });
    }

    const companyProfile = await Company.findOne({ user: req.user._id });
    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    let studentUser = await User.findOne({ email: String(studentEmail).toLowerCase() });
    if (!studentUser) {
      studentUser = await User.create({
        name: studentName,
        email: String(studentEmail).toLowerCase(),
        password: "TempPass@123",
        role: "student",
        emailVerified: true,
      });
    }

    let studentProfile = await Student.findOne({ user: studentUser._id });
    if (!studentProfile) {
      studentProfile = await Student.create({
        user: studentUser._id,
        college: "Direct Offer Candidate",
        branch: "General",
        cgpa: 7,
        graduation_year: new Date().getFullYear() + 1,
        skills: [],
        placement_eligible: true,
        bio: "Auto-created profile for direct offer letter workflow.",
      });
    }

    const stipend = Number(customDetails.salary) || 0;
    let internship = await Internship.findOne({
      company: companyProfile._id,
      title: position,
    });
    if (!internship) {
      internship = await Internship.create({
        company: companyProfile._id,
        title: position,
        description: `Direct offer role for ${position}`,
        stipend_min: stipend,
        stipend_max: stipend,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "open",
        batch_id: `DIRECT-${new Date().getFullYear()}`,
      });
    }

    let application = await Application.findOne({
      student: studentProfile._id,
      internship: internship._id,
    });
    if (!application) {
      application = await Application.create({
        student: studentProfile._id,
        internship: internship._id,
        status: "selected",
        resume_version: "direct-offer",
        cover_letter: "Auto-created for direct offer letter generation",
        source: "direct-offer",
      });
    }

    const content = replaceTemplateVariables(getDefaultOfferLetterTemplate(), {
      STUDENT_NAME: studentUser.name,
      COMPANY_NAME:
        companyProfile.company_name ||
        companyProfile.legal_name ||
        companyProfile.name ||
        "Company",
      POSITION: position,
      SALARY: customDetails.salary,
      DURATION: customDetails.duration,
      LOCATION: customDetails.location,
      START_DATE: new Date(customDetails.start_date).toLocaleDateString(),
      RESPONSIBILITIES: customDetails.responsibilities?.join("\n") || "",
      BENEFITS: customDetails.benefits?.join("\n") || "",
    });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const offerLetter = await OfferLetter.create({
      application: application._id,
      student: studentUser._id,
      internship: internship._id,
      company: companyProfile._id,
      template: null,
      content,
      status: "generated",
      custom_details: customDetails,
      expiry_date: expiryDate,
      generated_by: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Direct offer letter generated successfully",
      data: offerLetter,
    });
  } catch (error) {
    console.error("Generate direct offer letter error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate direct offer letter",
    });
  }
};

// @desc    Generate PDF for offer letter
// @route   POST /api/offer-letters/:id/generate-pdf
// @access  Private (Company/Coordinator/Admin)
export const generateOfferLetterPDFHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const offerLetter = await OfferLetter.findById(id)
      .populate("student")
      .populate("company")
      .populate("internship");

    if (!offerLetter) {
      return res.status(404).json({
        success: false,
        message: "Offer letter not found",
      });
    }

    const ctx = await resolveOfferLetterContext(offerLetter);
    const responsibilities = Array.isArray(
      offerLetter.custom_details?.responsibilities,
    )
      ? offerLetter.custom_details.responsibilities
      : [];
    const benefits = Array.isArray(offerLetter.custom_details?.benefits)
      ? offerLetter.custom_details.benefits
      : [];

    // Generate PDF
    const pdfUrl = await generateOfferLetterPDF({
      application: id,
      studentName: ctx.studentName,
      companyName: ctx.companyName,
      position: ctx.position,
      salary: offerLetter.custom_details?.salary ?? 0,
      duration: offerLetter.custom_details?.duration ?? 0,
      location: offerLetter.custom_details?.location || "N/A",
      startDate: offerLetter.custom_details?.start_date || new Date(),
      responsibilities,
      benefits,
    });

    // Update offer letter with PDF URL
    offerLetter.pdf_url = pdfUrl;
    await offerLetter.save();

    res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      data: {
        pdf_url: pdfUrl,
        offerLetter,
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF",
    });
  }
};

// @desc    Send offer letter to student
// @route   POST /api/offer-letters/:id/send
// @access  Private (Company/Coordinator/Admin)
export const sendOfferLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const offerLetter = await OfferLetter.findById(id)
      .populate("student")
      .populate("company")
      .populate("internship");

    if (!offerLetter) {
      return res.status(404).json({
        success: false,
        message: "Offer letter not found",
      });
    }

    if (req.user.role === "company") {
      const ctx = await resolveOfferLetterContext(offerLetter);
      const companyProfile = await Company.findOne({ user: req.user._id }).select(
        "_id",
      );
      if (
        !companyProfile ||
        String(companyProfile._id) !== String(ctx.companyId)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to send this offer letter",
        });
      }
    }

    const ctx = await resolveOfferLetterContext(offerLetter);
    if (!ctx.studentEmail) {
      return res.status(400).json({
        success: false,
        message: "Student email is missing for this offer letter",
      });
    }

    const salary = offerLetter.custom_details?.salary;
    await emailService.sendOfferLetter(ctx.studentEmail, {
      name: ctx.studentName,
      offerDetails: {
        company: ctx.companyName,
        position: ctx.position,
        salary,
      },
      offerLetterUrl: offerLetter.pdf_url,
      expiryDate: offerLetter.expiry_date,
    });

    // Update status
    offerLetter.status = "sent";
    offerLetter.email_sent = true;
    offerLetter.email_sent_at = new Date();
    await offerLetter.save();

    res.status(200).json({
      success: true,
      message: "Offer letter sent successfully",
      data: offerLetter,
    });
  } catch (error) {
    console.error("Send offer letter error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send offer letter",
    });
  }
};

// @desc    Get offer letter
// @route   GET /api/offer-letters/:id
// @access  Private
export const getOfferLetter = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findById(req.params.id)
      .populate("student")
      .populate("company")
      .populate("internship")
      .populate("template");

    if (!offerLetter) {
      return res.status(404).json({
        success: false,
        message: "Offer letter not found",
      });
    }

    // Check access
    if (req.user.role === "company") {
      const ctx = await resolveOfferLetterContext(offerLetter);
      const companyProfile = await Company.findOne({ user: req.user._id }).select(
        "_id",
      );
      if (
        !companyProfile ||
        String(companyProfile._id) !== String(ctx.companyId)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this offer letter",
        });
      }
    } else if (
      req.user.role !== "admin" &&
      req.user.role !== "coordinator"
    ) {
      const ctx = await resolveOfferLetterContext(offerLetter);
      if (String(ctx.studentUserId) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this offer letter",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: offerLetter,
    });
  } catch (error) {
    console.error("Get offer letter error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offer letter",
    });
  }
};

// @desc    Get all offer letters
// @route   GET /api/offer-letters
// @access  Private
export const getAllOfferLetters = async (req, res) => {
  try {
    let query = {};

    // Filter by role
    if (req.user.role === "student") {
      query.student = req.user._id;
    } else if (req.user.role === "company") {
      const companyProfile = await Company.findOne({ user: req.user._id }).select(
        "_id",
      );
      if (!companyProfile) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      query.company = companyProfile._id;
    }
    // Coordinators and admins see all

    const offerLetters = await OfferLetter.find(query)
      .populate("student")
      .populate("company")
      .populate("internship")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: offerLetters.length,
      data: offerLetters,
    });
  } catch (error) {
    console.error("Get offer letters error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offer letters",
    });
  }
};

// @desc    Accept offer letter
// @route   PUT /api/offer-letters/:id/accept
// @access  Private (Student)
export const acceptOfferLetter = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findById(req.params.id);

    if (!offerLetter) {
      return res.status(404).json({
        success: false,
        message: "Offer letter not found",
      });
    }

    // Check ownership
    if (offerLetter.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this offer letter",
      });
    }

    // Check expiry
    if (new Date() > offerLetter.expiry_date) {
      return res.status(400).json({
        success: false,
        message: "Offer letter has expired",
      });
    }

    offerLetter.status = "accepted";
    offerLetter.accepted_date = new Date();
    await offerLetter.save();

    res.status(200).json({
      success: true,
      message: "Offer accepted successfully",
      data: offerLetter,
    });
  } catch (error) {
    console.error("Accept offer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to accept offer letter",
    });
  }
};

// @desc    Reject offer letter
// @route   PUT /api/offer-letters/:id/reject
// @access  Private (Student)
export const rejectOfferLetter = async (req, res) => {
  try {
    const { reason } = req.body;
    const offerLetter = await OfferLetter.findById(req.params.id);

    if (!offerLetter) {
      return res.status(404).json({
        success: false,
        message: "Offer letter not found",
      });
    }

    // Check ownership
    if (offerLetter.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reject this offer letter",
      });
    }

    offerLetter.status = "rejected";
    offerLetter.rejected_date = new Date();
    await offerLetter.save();

    res.status(200).json({
      success: true,
      message: "Offer rejected successfully",
      data: offerLetter,
    });
  } catch (error) {
    console.error("Reject offer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reject offer letter",
    });
  }
};

// @desc    Download offer letter PDF
// @route   GET /api/offer-letters/:id/download
// @access  Private
export const downloadOfferLetterPDF = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findById(req.params.id)
      .populate("student")
      .populate("company");

    if (!offerLetter) {
      return res.status(404).json({
        success: false,
        message: "Offer letter not found",
      });
    }

    // Check access
    if (req.user.role === "company") {
      const ctx = await resolveOfferLetterContext(offerLetter);
      const companyProfile = await Company.findOne({ user: req.user._id }).select(
        "_id",
      );
      if (
        !companyProfile ||
        String(companyProfile._id) !== String(ctx.companyId)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to download this offer letter",
        });
      }
    } else if (
      req.user.role !== "admin" &&
      req.user.role !== "coordinator"
    ) {
      const ctx = await resolveOfferLetterContext(offerLetter);
      if (String(ctx.studentUserId) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to download this offer letter",
        });
      }
    }

    // Check if PDF exists
    if (!offerLetter.pdf_url) {
      return res.status(404).json({
        success: false,
        message: "PDF not generated yet. Please generate the PDF first.",
      });
    }

    // Resolve the stored pdf_url safely, even when it starts with a leading slash
    const pdfRelativePath = offerLetter.pdf_url.startsWith("/")
      ? offerLetter.pdf_url.slice(1)
      : offerLetter.pdf_url;
    const filePath = path.join(__dirname, "../..", pdfRelativePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "PDF file not found on server",
      });
    }

    // Set headers for download
    const ctx = await resolveOfferLetterContext(offerLetter);
    const safeStudentName = (ctx.studentName || "student").replace(
      /\s+/g,
      "-",
    );
    const fileName = `offer-letter-${safeStudentName}-${offerLetter._id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("File stream error:", error);
      res.status(500).json({
        success: false,
        message: "Error streaming PDF file",
      });
    });
  } catch (error) {
    console.error("Download offer letter error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to download offer letter",
    });
  }
};

// Helper functions
function replaceTemplateVariables(content, variables) {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), value || "");
  }
  return result;
}

function getDefaultOfferLetterTemplate() {
  return `
    OFFER LETTER

    Dear {{STUDENT_NAME}},

    We are pleased to offer you a position for the internship program at {{COMPANY_NAME}}.

    Position Details:
    - Position: {{POSITION}}
    - Salary: ₹{{SALARY}} per month
    - Duration: {{DURATION}} weeks
    - Location: {{LOCATION}}
    - Start Date: {{START_DATE}}

    Key Responsibilities:
    {{RESPONSIBILITIES}}

    Benefits:
    {{BENEFITS}}

    Please confirm your acceptance of this offer within 5 business days.

    Regards,
    {{COMPANY_NAME}}
  `;
}

export default {
  generateOfferLetter,
  generateDirectOfferLetter,
  generateOfferLetterPDFHandler,
  sendOfferLetter,
  getOfferLetter,
  getAllOfferLetters,
  acceptOfferLetter,
  rejectOfferLetter,
  downloadOfferLetterPDF,
};
