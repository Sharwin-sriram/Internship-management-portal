import Internship from "../models/Internship.js";
import Company from "../models/Company.js";

const getCompanyForUser = async (userId) => Company.findOne({ user: userId });

// @desc List open internships (student explore / public)
// @route GET /api/internships
// @access Public
export const listPublicInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ status: "open" })
      .populate("company", "company_name logo_url")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new internship
// @route POST /api/internships
// @access Company
export const createInternship = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const {
      title,
      description,
      skills_required,
      stipend_min,
      stipend_max,
      duration,
      location,
      deadline,
      batch_id,
    } = req.body;

    const min = Number(stipend_min);
    const max = Number(stipend_max);
    if (
      !title?.trim() ||
      !description?.trim() ||
      stipend_min === undefined ||
      stipend_min === null ||
      stipend_max === undefined ||
      stipend_max === null ||
      Number.isNaN(min) ||
      Number.isNaN(max) ||
      !deadline
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const internship = new Internship({
      company: company._id,
      title,
      description,
      skills_required: Array.isArray(skills_required)
        ? skills_required
        : skills_required
          ? String(skills_required)
              .split(",")
              .map((s) => s.trim())
          : [],
      stipend_min: min,
      stipend_max: max,
      duration: duration || "",
      location: location || "remote",
      deadline: new Date(deadline),
      batch_id: batch_id || "all",
      status: "open",
    });

    await internship.save();

    res.status(201).json({ success: true, data: internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get internships for current company
// @route GET /api/internships/me
// @access Company
export const getMyInternships = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });

    const internships = await Internship.find({ company: company._id }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ success: true, count: internships.length, data: internships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get internship by id
// @route GET /api/internships/:id
// @access Public
export const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      "company",
      "company_name logo_url",
    );
    if (!internship)
      return res
        .status(404)
        .json({ success: false, message: "Internship not found." });
    res.status(200).json({ success: true, data: internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update internship (company must own it)
// @route PUT /api/internships/:id
// @access Company
export const updateInternship = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });

    const internship = await Internship.findById(req.params.id);
    if (!internship)
      return res
        .status(404)
        .json({ success: false, message: "Internship not found." });
    if (String(internship.company) !== String(company._id)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only modify your own internships.",
        });
    }

    const updates = {};
    const allowed = [
      "title",
      "description",
      "skills_required",
      "stipend_min",
      "stipend_max",
      "duration",
      "location",
      "deadline",
      "status",
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    if (updates.skills_required && !Array.isArray(updates.skills_required)) {
      updates.skills_required = String(updates.skills_required)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (updates.deadline) updates.deadline = new Date(updates.deadline);
    if (updates.stipend_min !== undefined)
      updates.stipend_min = Number(updates.stipend_min);
    if (updates.stipend_max !== undefined)
      updates.stipend_max = Number(updates.stipend_max);

    const updated = await Internship.findByIdAndUpdate(
      internship._id,
      updates,
      { new: true, runValidators: true },
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete internship (company must own it)
// @route DELETE /api/internships/:id
// @access Company
export const deleteInternship = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });

    const internship = await Internship.findById(req.params.id);
    if (!internship)
      return res
        .status(404)
        .json({ success: false, message: "Internship not found." });
    if (String(internship.company) !== String(company._id)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only delete your own internships.",
        });
    }

    await internship.deleteOne();
    res.status(200).json({ success: true, message: "Internship deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {};
