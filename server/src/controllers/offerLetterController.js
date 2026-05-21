import OfferLetter from "../models/OfferLetter.js";
import Template from "../models/Template.js";
import Application from "../models/Application.js";
import User from "../models/user.js";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import emailService from "../services/emailService.js";
import { generateOfferLetterPDF } from "../services/pdfService.js";
import PDFDocument from "pdfkit";


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

export const generateModelPDF = async (req, res) => {
  try {
    const {
      candidateName = "Hannah Morales",
      position = "Marketing Specialist",
      startDate = "March 15, 2026",
      location = "Main Office",
      salary = "Competitive package as per company standards",
      companyName = "WARNER & SPENCER, CO.",
      expirationDate = "March 10, 2026",
      hrContact = "Teddy Yu",
      hrContactTitle = "HRD",
      date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      signatureType = "default",
      signatureImage = null
    } = req.body;

    const doc = new PDFDocument({
      size: "LETTER",
      margins: {
        top: 54,
        bottom: 54,
        left: 54,
        right: 54
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${candidateName.replace(/\s+/g, "_")}_Offer_Letter.pdf"`);
    doc.pipe(res);

    // Side borders
    const leftBorderColor = "#DCFCE7";
    doc.fillColor(leftBorderColor).rect(0, 0, 10, 792).fill();
    doc.fillColor(leftBorderColor).rect(602, 0, 10, 792).fill();

    // Geometric top-right corners
    doc.fillColor("#0A5C36").polygon([602, 110], [490, 0], [602, 0]).fill();
    doc.fillColor("#15803D").polygon([602, 80], [520, 0], [602, 0]).fill();
    doc.fillColor("#22C55E").polygon([602, 50], [550, 0], [602, 0]).fill();
    doc.fillColor("#4ADE80").polygon([602, 30], [570, 0], [602, 0]).fill();

    // Bottom-Left corner overlapping geometric squares/polygons
    doc.fillColor("#0A5C36").polygon([10, 680], [120, 792], [10, 792]).fill();
    doc.fillColor("#15803D").polygon([10, 715], [85, 792], [10, 792]).fill();
    doc.fillColor("#22C55E").polygon([10, 745], [55, 792], [10, 792]).fill();
    doc.fillColor("#4ADE80").polygon([10, 765], [35, 792], [10, 792]).fill();

    // Accent line
    doc.strokeColor("#DCFCE7").lineWidth(2).moveTo(10, 660).lineTo(140, 790).stroke();

    // Logo slanted growth
    doc.fillColor("#15803D");
    doc.polygon([40, 54], [48, 50], [48, 75], [40, 75]).fill();
    doc.polygon([51, 46], [59, 41], [59, 75], [51, 75]).fill();
    doc.polygon([62, 38], [70, 32], [70, 75], [62, 75]).fill();

    // Header Text
    doc.fillColor("#0A5C36").font("Helvetica-Bold").fontSize(18).text(companyName.toUpperCase(), 82, 36);
    doc.fillColor("#22C55E").font("Helvetica").fontSize(10).text("www.reallygreatsite.com", 82, 56);

    // Job offer letter header panel
    doc.fillColor("rgba(0, 0, 0, 0.05)").roundedRect(149, 113, 314, 46, 6).fill();
    doc.fillColor("#DCFCE7").strokeColor("#86EFAC").lineWidth(1).roundedRect(146, 110, 314, 46, 6).fillAndStroke();
    doc.fillColor("#0A5C36").font("Helvetica-Bold").fontSize(22).text("JOB OFFER LETTER", 146, 123, { align: "center", width: 314, characterSpacing: 1 });

    // To and Date
    doc.fillColor("#334155").font("Helvetica").fontSize(11).text("To:", 54, 185);
    doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11.5).text(candidateName, 54, 201);
    doc.fillColor("#475569").font("Helvetica").fontSize(10.5).text("123 Anywhere St., Any City ST 1234", 54, 217);
    doc.fillColor("#334155").font("Helvetica").fontSize(10.5).text(date, 400, 185, { align: "right", width: 158 });

    // Salutation
    doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11.5).text(`Dear ${candidateName},`, 54, 260);

    // Body
    const p1 = `We are pleased to offer you the position of ${position} at ${companyName}. Your skills and experience will be a valuable addition to our team.`;
    doc.fillColor("#334155").font("Helvetica").fontSize(10.5);
    doc.y = 282;
    doc.text(p1, { width: 504, align: "left", lineGap: 5 });

    // Details of the Offer
    doc.moveDown(1.5);
    doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11.5).text("Details of the Offer:", { lineGap: 6 });

    const details = [
      { label: "Position", value: position },
      { label: "Start Date", value: startDate },
      { label: "Work Location", value: location },
      { label: "Salary", value: salary }
    ];

    details.forEach(detail => {
      const currentY = doc.y;
      doc.fillColor("#15803D").font("Helvetica-Bold").fontSize(11).text("•", 68, currentY);
      doc.fillColor("#334155").font("Helvetica-Bold").fontSize(10.5).text(`${detail.label}: `, 80, currentY, { continued: true });
      doc.font("Helvetica").text(detail.value);
      doc.moveDown(0.4);
    });

    // Closing
    doc.moveDown(0.8);
    const p2 = `We look forward to your contribution and growth with us. Please confirm your acceptance by replying to this letter before ${expirationDate}.`;
    doc.fillColor("#334155").font("Helvetica").fontSize(10.5).text(p2, { width: 504, align: "left", lineGap: 5 });

    // Signature
    const sigStartY = doc.y + 24;
    doc.fillColor("#1E293B").font("Helvetica").fontSize(11).text("Sincerely,", 380, sigStartY);

    if (signatureType === "upload" && signatureImage) {
      try {
        const base64Data = signatureImage.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        doc.image(imageBuffer, 380, sigStartY + 10, { width: 120, height: 45 });
      } catch (err) {
        console.error("Error drawing signature image:", err);
      }
    }

    doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11).text(hrContact, 380, sigStartY + 68);
    doc.fillColor("#475569").font("Helvetica").fontSize(10).text(`${hrContactTitle} ${companyName}`, 380, sigStartY + 82);

    // Footer Waves
    doc.strokeColor("#DCFCE7").lineWidth(1.2);
    doc.moveTo(350, 792).bezierCurveTo(430, 760, 460, 720, 602, 710).stroke();
    doc.moveTo(380, 792).bezierCurveTo(460, 750, 490, 700, 602, 685).stroke();
    doc.moveTo(410, 792).bezierCurveTo(490, 740, 520, 680, 602, 660).stroke();

    // Footer Details
    const footerY = 705;
    doc.fillColor("#334155").font("Helvetica").fontSize(9.5).text("+123-456-7890", 350, footerY, { align: "right", width: 232 });
    doc.fillColor("#0A5C36").font("Helvetica-Bold").text("hello@reallygreatsite.com", 350, footerY + 13, { align: "right", width: 232 });
    doc.fillColor("#64748B").font("Helvetica").text("123 Anywhere St., Any City", 350, footerY + 26, { align: "right", width: 232 });

    doc.end();
  } catch (error) {
    console.error("PDF Download error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  generateOfferLetter,
  generateOfferLetterPDFHandler,
  sendOfferLetter,
  getOfferLetter,
  getAllOfferLetters,
  acceptOfferLetter,
  rejectOfferLetter,
  generateModelPDF,
};
