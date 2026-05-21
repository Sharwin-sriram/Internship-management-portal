import Company from "../models/Company.js";
import User from "../models/user.js";
import Internship from "../models/Internship.js";
import Application from "../models/Application.js";
import Student from "../models/Student.js";
import TalentUnlockRequest from "../models/TalentUnlockRequest.js";

// Helper for sending token response
const sendTokenResponse = async (user, statusCode, res, extraData = {}) => {
  const token = await user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 24) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: Boolean(user.emailVerified),
      },
      ...extraData,
    });
};

const isCompanyProfileComplete = (company) => {
  return Boolean(
    company?.legal_name &&
    company?.industry &&
    company?.size &&
    company?.website &&
    company?.primary_contact?.name &&
    company?.primary_contact?.email,
  );
};

// @desc    Create a new company
// @route   POST /api/companies
// @access  Public/Private
export const createCompany = async (req, res) => {
  try {
    const {
      legal_name,
      company_name,
      industry,
      size,
      website,
      primary_contact,
      logo_url,
      description,
      social_links,
      office_locations,
    } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    if (
      !legal_name ||
      !industry ||
      !size ||
      !website ||
      !primary_contact?.name ||
      !primary_contact?.email
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Legal name, industry, size, website, and primary contact are required.",
      });
    }

    const existing = await Company.findOne({ user: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Company profile already exists." });
    }

    const company = new Company({
      user: req.user._id,
      company_name: company_name || legal_name,
      legal_name,
      industry,
      size,
      website,
      address: req.body.address || "",
      primary_contact,
      logo_url: logo_url || "",
      description: description || "",
      social_links: social_links || [],
      office_locations: office_locations || [],
      approval_status: "pending",
      is_verified: false,
      profile_completed: true,
      profile_completed_at: new Date(),
    });
    await company.save();
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Register a company (creates user + company profile)
// @route   POST /api/companies/register
// @access  Public
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password, company_name, industry } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (!industry || !String(industry).trim()) {
      return res.status(400).json({
        success: false,
        message: "Industry is required.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "company",
    });

    const company = await Company.create({
      user: user._id,
      company_name: company_name || "",
      legal_name: "",
      industry: String(industry).trim(),
      size: "",
      website: "",
      primary_contact: {
        name,
        email: email.toLowerCase(),
        phone: "",
        title: "",
      },
      logo_url: "",
      description: "",
      social_links: [],
      office_locations: [],
      approval_status: "pending",
      is_verified: false,
      profile_completed: false,
    });

    await sendTokenResponse(user, 201, res, { company });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during company registration",
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res
      .status(200)
      .json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, error: "Company not found" });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getCompanyForUser = async (userId) => {
  return Company.findOne({ user: userId });
};

// @desc    Get current company profile
// @route   GET /api/companies/me
// @access  Company
export const getMyCompany = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching company profile.",
    });
  }
};

// @desc    Update current company profile
// @route   PUT /api/companies/me
// @access  Company
export const updateMyCompany = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const updates = {
      company_name: req.body.company_name ?? company.company_name,
      legal_name: req.body.legal_name ?? company.legal_name,
      industry: req.body.industry ?? company.industry,
      size: req.body.size ?? company.size,
      website: req.body.website ?? company.website,
      address: req.body.address ?? company.address,
      // Merge primary_contact so partial updates don't remove existing subfields (like email)
      primary_contact: req.body.primary_contact
        ? { ...(company.primary_contact || {}), ...req.body.primary_contact }
        : company.primary_contact,
      logo_url: req.body.logo_url ?? company.logo_url,
      description: req.body.description ?? company.description,
      social_links: req.body.social_links ?? company.social_links,
      office_locations: req.body.office_locations ?? company.office_locations,
    };

    const updated = await Company.findByIdAndUpdate(company._id, updates, {
      new: true,
      runValidators: true,
    });

    if (
      updated &&
      isCompanyProfileComplete(updated) &&
      !updated.profile_completed
    ) {
      updated.profile_completed = true;
      updated.profile_completed_at = new Date();
      await updated.save();
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating company profile.",
    });
  }
};

// @desc    List company registration requests
// @route   GET /api/companies/requests
// @access  Coordinator
export const getCompanyRequests = async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const companies = await Company.find({ approval_status: status });
    res
      .status(200)
      .json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching requests.",
    });
  }
};

// @desc    Approve or reject a company registration
// @route   PUT /api/companies/:id/approval
// @access  Coordinator
export const updateCompanyApproval = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { approval_status: status, is_verified: status === "approved" },
      { new: true, runValidators: true },
    );

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    }

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating approval.",
    });
  }
};

// @desc    Company login
// @route   POST /api/companies/login
// @access  Public
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== "company") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get company dashboard metrics
// @route   GET /api/companies/me/dashboard
// @access  Company
export const getCompanyDashboard = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const internshipIds = await Internship.find({
      company: company._id,
    }).distinct("_id");
    const activePostings = await Internship.countDocuments({
      company: company._id,
      status: "open",
    });
    const totalApplications = await Application.countDocuments({
      internship: { $in: internshipIds },
    });
    const shortlistedCandidates = await Application.countDocuments({
      internship: { $in: internshipIds },
      status: "shortlisted",
    });
    const offers = await Application.countDocuments({
      internship: { $in: internshipIds },
      status: "selected",
    });
    const pendingApplications = await Application.countDocuments({
      internship: { $in: internshipIds },
      status: "applied",
    });
    const draftPostings = await Internship.countDocuments({
      company: company._id,
      status: "draft",
    });

    const offerConversionRate =
      totalApplications > 0
        ? Number(((offers / totalApplications) * 100).toFixed(1))
        : 0;

    // Get recommended interns based on company's posted internships
    const internships = await Internship.find({ company: company._id });
    const companySkills = internships.reduce((acc, intern) => {
      if (intern.skills_required) {
        intern.skills_required.forEach((s) => acc.add(s.toLowerCase()));
      }
      return acc;
    }, new Set());

    let studentQuery = { placement_eligible: true };
    if (companySkills.size > 0) {
      studentQuery.skills = { $in: Array.from(companySkills) };
    }

    let recommended = await Student.find(studentQuery)
      .populate("user", "name email")
      .sort({ cgpa: -1 })
      .limit(4);

    if (recommended.length === 0) {
      recommended = await Student.find({ placement_eligible: true })
        .populate("user", "name email")
        .sort({ cgpa: -1 })
        .limit(4);
    }

    const recommendedInterns = recommended.map((student) => ({
      id: student._id,
      name: student.user?.name || "Student",
      branch: student.branch,
      cgpa: student.cgpa,
      skills: student.skills || [],
      graduationYear: student.graduation_year,
    }));

    res.status(200).json({
      success: true,
      data: {
        activePostings,
        totalApplications,
        shortlistedCandidates,
        offerConversionRate,
        pendingActions: pendingApplications + draftPostings,
        approvalStatus: company.approval_status,
        recommendedInterns,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while loading dashboard.",
    });
  }
};

// @desc    Shortlisted applications for scheduling interviews
// @route   GET /api/companies/me/shortlisted-applications
// @access  Company
export const getMyShortlistedApplications = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const internshipIds = await Internship.find({
      company: company._id,
    }).distinct("_id");
    const applications = await Application.find({
      internship: { $in: internshipIds },
      status: { $in: ["shortlisted", "interviewing"] },
    })
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate("internship", "title")
      .sort({ last_updated: -1 })
      .limit(100);

    const data = applications.map((app) => ({
      id: app._id,
      studentId: app.student?._id,
      studentName: app.student?.user?.name || "Student",
      studentEmail: app.student?.user?.email || "",
      roleTitle: app.internship?.title || "Internship",
      status: app.status,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while loading applications.",
    });
  }
};

// @desc    Applications submitted to the company's internships
// @route   GET /api/companies/me/applications
// @access  Company
export const getMyApplications = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const internshipIds = await Internship.find({
      company: company._id,
    }).distinct("_id");
    const { internshipId, status } = req.query;
    const query = {
      internship: { $in: internshipIds },
    };

    if (internshipId) {
      query.internship = internshipId;
    }

    if (status) {
      query.status = status;
    } else {
      // Active pipeline only; selected/rejected move to history/archive.
      query.status = { $nin: ["selected", "rejected"] };
    }

    const applications = await Application.find(query)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("internship", "title")
      .sort({ last_updated: -1 })
      .limit(200);

    const data = applications.map((app) => ({
      id: app._id,
      studentId: app.student?._id,
      studentName: app.student?.user?.name || "Student",
      studentEmail: app.student?.user?.email || "",
      studentPhone: app.student?.user?.phone || "",
      studentAddress: app.student?.address || "",
      roleTitle: app.internship?.title || "Internship",
      internshipId: app.internship?._id,
      status: app.status,
      appliedAt: app.applied_at,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while loading applications.",
    });
  }
};

// @desc    Archived application history (selected/rejected) for company internships
// @route   GET /api/companies/me/applications/history
// @access  Company
export const getMyApplicationsHistory = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const internshipIds = await Internship.find({
      company: company._id,
    }).distinct("_id");
    const { internshipId, status } = req.query;
    const query = {
      internship: { $in: internshipIds },
      status: { $in: ["selected", "rejected"] },
    };

    if (internshipId) {
      query.internship = internshipId;
    }

    if (status && ["selected", "rejected"].includes(String(status))) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate("internship", "title")
      .sort({ last_updated: -1 })
      .limit(300);

    const data = applications.map((app) => ({
      id: app._id,
      studentId: app.student?._id,
      studentName: app.student?.user?.name || "Student",
      studentEmail: app.student?.user?.email || "",
      roleTitle: app.internship?.title || "Internship",
      internshipId: app.internship?._id,
      status: app.status,
      appliedAt: app.applied_at,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while loading applications history.",
    });
  }
};

// @desc    Shortlist a company application
// @route   PATCH /api/companies/me/applications/:applicationId/shortlist
// @access  Company
export const shortlistMyApplication = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const application = await Application.findById(
      req.params.applicationId,
    ).populate("internship", "company title");
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    if (String(application.internship?.company) !== String(company._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own internships.",
      });
    }

    if (application.status !== "shortlisted") {
      application.status = "shortlisted";
      await application.save();
    }

    res.status(200).json({
      success: true,
      data: {
        id: application._id,
        status: application.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while shortlisting application.",
    });
  }
};

// @desc    Reject a company application directly
// @route   PATCH /api/companies/me/applications/:applicationId/reject
// @access  Company
export const rejectMyApplication = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const application = await Application.findById(
      req.params.applicationId,
    ).populate("internship", "company title");
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    if (String(application.internship?.company) !== String(company._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own internships.",
      });
    }

    const { rejection_reason } = req.body;

    application.status = "rejected";
    application.rejection_reason = rejection_reason || "";
    await application.save();

    res.status(200).json({
      success: true,
      data: {
        id: application._id,
        status: application.status,
        rejection_reason: application.rejection_reason,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while rejecting application.",
    });
  }
};

// @desc    Get company analytics
// @route   GET /api/companies/me/analytics
// @access  Company
export const getCompanyAnalytics = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const rangeDays = Number(req.query.rangeDays || 90);
    const startDate = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);
    const internshipIds = await Internship.find({
      company: company._id,
    }).distinct("_id");

    const volume = await Application.aggregate([
      {
        $match: {
          internship: { $in: internshipIds },
          applied_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$applied_at" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const sources = await Application.aggregate([
      { $match: { internship: { $in: internshipIds } } },
      {
        $group: {
          _id: { $ifNull: ["$source", "unknown"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const offerStats = await Application.aggregate([
      { $match: { internship: { $in: internshipIds }, status: "selected" } },
      {
        $project: {
          durationMs: {
            $subtract: [
              { $ifNull: ["$offer_made_at", "$last_updated"] },
              "$applied_at",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDurationMs: { $avg: "$durationMs" },
        },
      },
    ]);

    const avgMs = offerStats[0]?.avgDurationMs || 0;
    const averageTimeToOfferDays = avgMs
      ? Number((avgMs / (1000 * 60 * 60 * 24)).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        applicationVolume: volume.map((entry) => ({
          date: entry._id,
          count: entry.count,
        })),
        sourceBreakdown: sources.map((entry) => ({
          source: entry._id,
          count: entry.count,
        })),
        averageTimeToOfferDays,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while loading analytics.",
    });
  }
};

// @desc    Get recruiters for company
// @route   GET /api/companies/me/recruiters
// @access  Company
export const getRecruiters = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }
    res.status(200).json({ success: true, data: company.recruiters || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching recruiters.",
    });
  }
};

// @desc    Add a recruiter
// @route   POST /api/companies/me/recruiters
// @access  Company
export const addRecruiter = async (req, res) => {
  try {
    const { name, email, phone, title } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Recruiter name and email are required.",
      });
    }

    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    company.recruiters.push({
      name,
      email,
      phone: phone || "",
      title: title || "",
    });
    await company.save();
    res.status(201).json({ success: true, data: company.recruiters });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while adding recruiter.",
    });
  }
};

// @desc    Remove a recruiter
// @route   DELETE /api/companies/me/recruiters/:recruiterId
// @access  Company
export const removeRecruiter = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    company.recruiters = company.recruiters.filter(
      (recruiter) => recruiter._id.toString() !== req.params.recruiterId,
    );
    await company.save();
    res.status(200).json({ success: true, data: company.recruiters });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while removing recruiter.",
    });
  }
};

// @desc    Search talent pool
// @route   GET /api/companies/talent/search
// @access  Company
export const searchTalent = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const { skill, branch, minCgpa, graduationYear } = req.query;
    const filter = { placement_eligible: true };

    if (branch) filter.branch = branch;
    if (graduationYear) filter.graduation_year = Number(graduationYear);
    if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };
    if (skill) filter.skills = { $in: [skill] };

    const students = await Student.find(filter).populate("user", "name email");
    const studentIds = students.map((student) => student._id);

    const approved = await TalentUnlockRequest.find({
      company: company._id,
      student: { $in: studentIds },
      status: "approved",
    });
    const approvedSet = new Set(
      approved.map((item) => item.student.toString()),
    );

    const data = students.map((student) => {
      const approvedContact = approvedSet.has(student._id.toString());
      return {
        id: student._id,
        name: student.user?.name || "Student",
        branch: student.branch,
        cgpa: student.cgpa,
        graduation_year: student.graduation_year,
        skills: student.skills || [],
        contact: approvedContact ? { email: student.user?.email } : null,
        contact_status: approvedContact ? "unlocked" : "locked",
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while searching talent.",
    });
  }
};

// @desc    Request contact unlock for a student
// @route   POST /api/companies/talent/requests
// @access  Company
export const requestTalentUnlock = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID is required." });
    }

    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const existing = await TalentUnlockRequest.findOne({
      company: company._id,
      student: studentId,
    });
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    const request = await TalentUnlockRequest.create({
      company: company._id,
      student: studentId,
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while requesting unlock.",
    });
  }
};

// @desc    List company talent requests
// @route   GET /api/companies/talent/requests
// @access  Company
export const listTalentUnlockRequests = async (req, res) => {
  try {
    const company = await getCompanyForUser(req.user._id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const requests = await TalentUnlockRequest.find({
      company: company._id,
    }).populate("student", "branch cgpa graduation_year");
    res
      .status(200)
      .json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching requests.",
    });
  }
};

// @desc    Approve talent unlock request
// @route   PUT /api/companies/talent/requests/:id/approve
// @access  Coordinator
export const approveTalentUnlockRequest = async (req, res) => {
  try {
    const request = await TalentUnlockRequest.findById(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });
    }

    request.status = "approved";
    request.approved_by = req.user._id;
    request.approved_at = new Date();
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while approving request.",
    });
  }
};

// @desc    Reject talent unlock request
// @route   PUT /api/companies/talent/requests/:id/reject
// @access  Coordinator
export const rejectTalentUnlockRequest = async (req, res) => {
  try {
    const request = await TalentUnlockRequest.findById(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });
    }

    request.status = "rejected";
    request.approved_by = req.user._id;
    request.approved_at = new Date();
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while rejecting request.",
    });
  }
};
