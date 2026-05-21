import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Company from "../models/Company.js";
import User from "../models/user.js";
import JobApplication from "../models/JobApplication.js";
import Application from "../models/Application.js";
import Student from "../models/Student.js";

function countByStatus(applications, statusKeys) {
  return applications.filter((a) => statusKeys.includes(a.status)).length;
}

async function getApplicationStatsForInternship(internshipId) {
  const id = new mongoose.Types.ObjectId(internshipId);

  const [jobApps, portalApps] = await Promise.all([
    JobApplication.find({ internship: id }).lean(),
    Application.find({ internship: id })
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .lean(),
  ]);

  const merged = [
    ...jobApps.map((a) => ({
      source: "job_application",
      id: a._id,
      studentName: `${a.firstName || ""} ${a.lastName || ""}`.trim(),
      email: a.email,
      status: a.status,
      cgpa: a.cgpa,
      department: a.department,
      stream: a.stream,
      appliedAt: a.createdAt,
      studentUserId: null,
    })),
    ...portalApps.map((a) => ({
      source: "portal",
      id: a._id,
      studentName: a.student?.user?.name || "Student",
      email: a.student?.user?.email || "",
      status: a.status,
      cgpa: a.student?.cgpa,
      department: a.student?.branch,
      stream: a.student?.branch,
      appliedAt: a.applied_at || a.createdAt,
      studentUserId: a.student?.user?._id?.toString() || null,
      studentId: a.student?._id?.toString() || null,
    })),
  ];

  const stats = {
    total: merged.length,
    applied: countByStatus(merged, ["applied", "pending", "reviewed"]),
    shortlisted: countByStatus(merged, ["shortlisted"]),
    interview: countByStatus(merged, ["interview_scheduled", "interviewing"]),
    selected: countByStatus(merged, ["selected"]),
    rejected: countByStatus(merged, ["rejected"]),
    offer: countByStatus(merged, ["offer_issued"]),
  };

  return { stats, applications: merged };
}

// @desc    All internships with application counts (admin)
// @route   GET /api/admin/internships
export const listAdminInternships = async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate("company", "company_name industry logo_url approval_status")
      .sort({ createdAt: -1 })
      .lean();

    const ids = internships.map((i) => i._id);

    const [jobCounts, portalCounts] = await Promise.all([
      JobApplication.aggregate([
        { $match: { internship: { $in: ids } } },
        { $group: { _id: "$internship", count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { internship: { $in: ids } } },
        { $group: { _id: "$internship", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map();
    for (const row of jobCounts) {
      countMap.set(String(row._id), (countMap.get(String(row._id)) || 0) + row.count);
    }
    for (const row of portalCounts) {
      countMap.set(String(row._id), (countMap.get(String(row._id)) || 0) + row.count);
    }

    const data = internships.map((item) => ({
      ...item,
      applicationCount: countMap.get(String(item._id)) || 0,
      companyName:
        item.company?.company_name || item.company?.legal_name || "Unknown company",
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Internship detail + applicant tracking (admin)
// @route   GET /api/admin/internships/:id
export const getAdminInternshipDetail = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid internship id" });
    }

    const internship = await Internship.findById(req.params.id)
      .populate("company")
      .lean();

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    const { stats, applications } = await getApplicationStatsForInternship(
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: {
        internship,
        company: internship.company,
        stats,
        applications,
        eligibility: {
          batch: internship.batch_id,
          skills: internship.skills_required || [],
          location: internship.location,
          deadline: internship.deadline,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Company profile for admin (view like student profile)
// @route   GET /api/admin/companies/:id
export const getAdminCompanyProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid company id" });
    }

    const company = await Company.findById(req.params.id).lean();
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const owner = company.user
      ? await User.findById(company.user).select("name email role createdAt").lean()
      : null;

    const internships = await Internship.find({ company: company._id })
      .sort({ createdAt: -1 })
      .lean();

    const ids = internships.map((i) => i._id);
    const jobCounts = await JobApplication.aggregate([
      { $match: { internship: { $in: ids } } },
      { $group: { _id: "$internship", count: { $sum: 1 } } },
    ]);
    const portalCounts = await Application.aggregate([
      { $match: { internship: { $in: ids } } },
      { $group: { _id: "$internship", count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    for (const row of [...jobCounts, ...portalCounts]) {
      countMap.set(String(row._id), (countMap.get(String(row._id)) || 0) + row.count);
    }

    const internshipsWithCounts = internships.map((i) => ({
      ...i,
      applicationCount: countMap.get(String(i._id)) || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        company,
        owner,
        internships: internshipsWithCounts,
        stats: {
          totalInternships: internships.length,
          openInternships: internships.filter((i) => i.status === "open").length,
          totalApplications: [...countMap.values()].reduce((a, b) => a + b, 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
