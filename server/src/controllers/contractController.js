import InternshipContract from "../models/InternshipContract.js";
import Template from "../models/Template.js";
import Application from "../models/Application.js";
import { generateContractPDF } from "../services/pdfService.js";

// @desc    Create internship contract
// @route   POST /api/contracts
// @access  Private (Coordinator/Admin)
export const createContract = async (req, res) => {
  try {
    const { applicationId, templateId, contractDetails } = req.body;

    if (!applicationId || !templateId || !contractDetails) {
      return res.status(400).json({
        success: false,
        message:
          "Application ID, template ID, and contract details are required",
      });
    }

    const application = await Application.findById(applicationId)
      .populate("student")
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

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Replace template variables
    let content = template.content;
    content = replaceContractVariables(content, {
      STUDENT_NAME: application.student.name,
      COMPANY_NAME: application.internship.company.name,
      POSITION: contractDetails.position,
      LOCATION: contractDetails.location,
      START_DATE: new Date(contractDetails.start_date).toLocaleDateString(),
      END_DATE: new Date(contractDetails.end_date).toLocaleDateString(),
      STIPEND: contractDetails.stipend,
      REPORTING_TO: contractDetails.reporting_to,
      RESPONSIBILITIES: contractDetails.responsibilities?.join("\n") || "",
    });

    const contract = await InternshipContract.create({
      application: applicationId,
      student: application.student._id,
      company: application.internship.company._id,
      internship: application.internship._id,
      template: templateId,
      content,
      contract_details: contractDetails,
      created_by: req.user._id,
      activity_log: [
        {
          action: "contract_created",
          performed_by: req.user._id,
          description: "Contract created and ready for review",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Contract created successfully",
      data: contract,
    });
  } catch (error) {
    console.error("Create contract error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create contract",
    });
  }
};

// @desc    Generate PDF for contract
// @route   POST /api/contracts/:id/generate-pdf
// @access  Private
export const generateContractPDFHandler = async (req, res) => {
  try {
    const contract = await InternshipContract.findById(req.params.id)
      .populate("student")
      .populate("company")
      .populate("internship");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    const pdfUrl = await generateContractPDF({
      application: contract._id,
      studentName: contract.student.name,
      companyName: contract.company.name,
      position: contract.contract_details.position,
      location: contract.contract_details.location,
      startDate: contract.contract_details.start_date,
      endDate: contract.contract_details.end_date,
      stipend: contract.contract_details.stipend,
      reportingTo: contract.contract_details.reporting_to,
      responsibilities: contract.contract_details.responsibilities,
    });

    contract.pdf_url = pdfUrl;
    await contract.save();

    res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      data: { pdf_url: pdfUrl, contract },
    });
  } catch (error) {
    console.error("Generate contract PDF error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF",
    });
  }
};

// @desc    Get contract
// @route   GET /api/contracts/:id
// @access  Private
export const getContract = async (req, res) => {
  try {
    const contract = await InternshipContract.findById(req.params.id)
      .populate("student")
      .populate("company")
      .populate("internship")
      .populate("template")
      .populate("created_by", "name email");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Check access
    if (
      req.user.role !== "admin" &&
      req.user.role !== "coordinator" &&
      contract.student._id.toString() !== req.user._id.toString() &&
      contract.company._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this contract",
      });
    }

    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    console.error("Get contract error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contract",
    });
  }
};

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
export const getAllContracts = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "student") {
      query.student = req.user._id;
    } else if (req.user.role === "company") {
      query.company = req.user._id;
    }

    const contracts = await InternshipContract.find(query)
      .populate("student")
      .populate("company")
      .populate("internship")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts,
    });
  } catch (error) {
    console.error("Get contracts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contracts",
    });
  }
};

// @desc    Sign contract (Student or Company)
// @route   POST /api/contracts/:id/sign
// @access  Private
export const signContract = async (req, res) => {
  try {
    const { signatureData, role } = req.body;

    if (!signatureData || !role) {
      return res.status(400).json({
        success: false,
        message: "Signature data and role are required",
      });
    }

    const contract = await InternshipContract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    if (role === "student") {
      if (contract.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only the student can sign on behalf of student",
        });
      }

      contract.student_signature = {
        signed: true,
        signature_url: signatureData,
        signed_at: new Date(),
        ip_address: req.ip,
      };
    } else if (role === "company") {
      if (contract.company.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only company representative can sign on behalf of company",
        });
      }

      contract.company_signature = {
        signed: true,
        signature_url: signatureData,
        signed_at: new Date(),
        signed_by: req.user._id,
        ip_address: req.ip,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "student" or "company"',
      });
    }

    // Check if both parties have signed
    if (
      contract.student_signature.signed &&
      contract.company_signature.signed
    ) {
      contract.status = "signed";
    } else {
      contract.status = "pending_student_sign";
      if (contract.student_signature.signed) {
        contract.status = "pending_company_sign";
      }
    }

    contract.activity_log.push({
      action: "contract_signed",
      performed_by: req.user._id,
      description: `${role === "student" ? "Student" : "Company"} signed the contract`,
    });

    await contract.save();

    res.status(200).json({
      success: true,
      message: `Contract signed by ${role} successfully`,
      data: contract,
    });
  } catch (error) {
    console.error("Sign contract error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to sign contract",
    });
  }
};

// @desc    Approve contract (Coordinator/Admin)
// @route   PUT /api/contracts/:id/approve
// @access  Private (Coordinator/Admin)
export const approveContract = async (req, res) => {
  try {
    const { approval_notes } = req.body;

    if (req.user.role !== "coordinator" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only coordinators and admins can approve contracts",
      });
    }

    const contract = await InternshipContract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    if (contract.status !== "signed") {
      return res.status(400).json({
        success: false,
        message: "Contract must be signed by both parties before approval",
      });
    }

    contract.approval_status = {
      coordinator_approved: true,
      approved_by: req.user._id,
      approval_date: new Date(),
      approval_notes: approval_notes || null,
    };
    contract.status = "completed";

    contract.activity_log.push({
      action: "contract_approved",
      performed_by: req.user._id,
      description: "Coordinator approved the contract",
    });

    await contract.save();

    res.status(200).json({
      success: true,
      message: "Contract approved successfully",
      data: contract,
    });
  } catch (error) {
    console.error("Approve contract error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve contract",
    });
  }
};

// @desc    Terminate contract
// @route   PUT /api/contracts/:id/terminate
// @access  Private (Coordinator/Admin)
export const terminateContract = async (req, res) => {
  try {
    const { termination_reason } = req.body;

    const contract = await InternshipContract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    contract.status = "terminated";
    contract.activity_log.push({
      action: "contract_terminated",
      performed_by: req.user._id,
      description: termination_reason || "Contract terminated",
    });

    await contract.save();

    res.status(200).json({
      success: true,
      message: "Contract terminated successfully",
      data: contract,
    });
  } catch (error) {
    console.error("Terminate contract error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to terminate contract",
    });
  }
};

// Helper function
function replaceContractVariables(content, variables) {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), value || "");
  }
  return result;
}

export default {
  createContract,
  generateContractPDFHandler,
  getContract,
  getAllContracts,
  signContract,
  approveContract,
  terminateContract,
};
