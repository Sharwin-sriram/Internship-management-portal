import OfferLetter from "../models/OfferLetter.js";
import Template from "../models/Template.js";
import Application from "../models/Application.js";
import User from "../models/user.js";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import emailService from "../services/emailService.js";
import { generateOfferLetterPDF } from "../services/pdfService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      .populate("student")
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

    // Replace variables in template
    content = replaceTemplateVariables(content, {
      STUDENT_NAME: application.student.name,
      COMPANY_NAME: application.internship.company.name,
      POSITION: application.internship.title,
      SALARY: customDetails.salary,
      DURATION: customDetails.duration,
      LOCATION: customDetails.location,
      START_DATE: new Date(customDetails.start_date).toLocaleDateString(),
      RESPONSIBILITIES: customDetails.responsibilities?.join("\n") || "",
      BENEFITS: customDetails.benefits?.join("\n") || "",
    });

    // Create expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Create offer letter record
    const offerLetter = await OfferLetter.create({
      application: applicationId,
      student: application.student._id,
      internship: application.internship._id,
      company: application.internship.company._id,
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

    // Generate PDF
    const pdfUrl = await generateOfferLetterPDF({
      application: id,
      studentName: offerLetter.student.name,
      companyName: offerLetter.company.name,
      position: offerLetter.internship.title,
      salary: offerLetter.custom_details.salary,
      duration: offerLetter.custom_details.duration,
      location: offerLetter.custom_details.location,
      startDate: offerLetter.custom_details.start_date,
      responsibilities: offerLetter.custom_details.responsibilities,
      benefits: offerLetter.custom_details.benefits,
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
      .populate("company");

    if (!offerLetter) {
      return res.status(404).json({
        success: false,
        message: "Offer letter not found",
      });
    }

    // Send email
    await emailService.sendOfferLetter(offerLetter.student.email, {
      name: offerLetter.student.name,
      offerDetails: {
        company: offerLetter.company.name,
        position: offerLetter.internship.title,
        salary: offerLetter.custom_details.salary,
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
    if (
      req.user.role !== "admin" &&
      req.user.role !== "coordinator" &&
      offerLetter.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this offer letter",
      });
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
      query.company = req.user._id;
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
    if (
      req.user.role !== "admin" &&
      req.user.role !== "coordinator" &&
      req.user.role !== "company" &&
      offerLetter.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to download this offer letter",
      });
    }

    // Check if PDF exists
    if (!offerLetter.pdf_url) {
      return res.status(404).json({
        success: false,
        message: "PDF not generated yet. Please generate the PDF first.",
      });
    }

    // Get the file path
    const filePath = path.join(__dirname, "../..", offerLetter.pdf_url);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "PDF file not found on server",
      });
    }

    // Set headers for download
    const fileName = `offer-letter-${offerLetter.student.name.replace(/\s+/g, "-")}-${offerLetter._id}.pdf`;
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
  generateOfferLetterPDFHandler,
  sendOfferLetter,
  getOfferLetter,
  getAllOfferLetters,
  acceptOfferLetter,
  rejectOfferLetter,
  downloadOfferLetterPDF,
};
