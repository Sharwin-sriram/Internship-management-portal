import Internship from "../models/Internship.js";
import Company from "../models/Company.js";

// @desc    Create a new internship posting
// @route   POST /api/internships
// @access  Private (Company, Admin, Coordinator)
export const createInternship = async (req, res) => {
  try {
    const {
      title,
      description,
      stipend_min,
      stipend_max,
      deadline,
      batch_id,
      status,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      stipend_min === undefined ||
      stipend_max === undefined ||
      !deadline ||
      !batch_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, stipend_min, stipend_max, deadline, and batch_id are required fields.",
      });
    }

    let companyId;

    if (req.user.role === "company") {
      const company = await Company.findOne({ user: req.user._id });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company profile not found for this user.",
        });
      }
      // Check if company is approved to post internships
      if (company.approval_status !== "approved") {
        return res.status(403).json({
          success: false,
          message: "Your company profile is not approved yet. Postings are disabled.",
        });
      }
      companyId = company._id;
    } else if (req.user.role === "admin" || req.user.role === "coordinator") {
      companyId = req.body.company;
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "Company ID is required for admin/coordinator postings.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create internship postings.",
      });
    }

    const internship = new Internship({
      company: companyId,
      title,
      description,
      stipend_min: Number(stipend_min),
      stipend_max: Number(stipend_max),
      deadline: new Date(deadline),
      batch_id,
      status: status || "open",
    });

    await internship.save();

    res.status(201).json({
      success: true,
      message: "Internship posted successfully!",
      data: internship,
    });
  } catch (error) {
    console.error("[InternshipController] Error in createInternship:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while posting internship.",
    });
  }
};

// @desc    Get all internship postings
// @route   GET /api/internships
// @access  Public
export const getInternships = async (req, res) => {
  try {
    const { companyId, status, batch_id } = req.query;
    const query = {};

    if (companyId) {
      query.company = companyId;
    }
    if (status) {
      query.status = status;
    }
    if (batch_id) {
      query.batch_id = batch_id;
    }

    const internships = await Internship.find(query)
      .populate("company", "company_name logo_url website industry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    console.error("[InternshipController] Error in getInternships:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching internships.",
    });
  }
};

// @desc    Get a single internship posting by ID
// @route   GET /api/internships/:id
// @access  Public
export const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      "company",
      "company_name logo_url website industry description size"
    );

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship posting not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    console.error("[InternshipController] Error in getInternshipById:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching internship detail.",
    });
  }
};

// @desc    Update an internship posting
// @route   PUT /api/internships/:id
// @access  Private (Company, Admin, Coordinator)
export const updateInternship = async (req, res) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship posting not found.",
      });
    }

    // Ownership check for company user
    if (req.user.role === "company") {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || String(internship.company) !== String(company._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own internship postings.",
        });
      }
    }

    const {
      title,
      description,
      stipend_min,
      stipend_max,
      deadline,
      batch_id,
      status,
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (stipend_min !== undefined) updates.stipend_min = Number(stipend_min);
    if (stipend_max !== undefined) updates.stipend_max = Number(stipend_max);
    if (deadline !== undefined) updates.deadline = new Date(deadline);
    if (batch_id !== undefined) updates.batch_id = batch_id;
    if (status !== undefined) updates.status = status;

    internship = await Internship.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Internship updated successfully!",
      data: internship,
    });
  } catch (error) {
    console.error("[InternshipController] Error in updateInternship:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating internship.",
    });
  }
};

// @desc    Delete an internship posting
// @route   DELETE /api/internships/:id
// @access  Private (Company, Admin, Coordinator)
export const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship posting not found.",
      });
    }

    // Ownership check for company user
    if (req.user.role === "company") {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || String(internship.company) !== String(company._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own internship postings.",
        });
      }
    }

    await Internship.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Internship deleted successfully!",
    });
  } catch (error) {
    console.error("[InternshipController] Error in deleteInternship:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting internship.",
    });
  }
};
