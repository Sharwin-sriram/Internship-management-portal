import fs from "fs/promises";
import mongoose from "mongoose";
import JobApplication from "../models/JobApplication.js";
import Application from "../models/Application.js";
import Student from "../models/Student.js";
import Internship from "../models/Internship.js";
import Interview from "../models/Interview.js";
import OfferLetter from "../models/OfferLetter.js";

function formatInterviewTimeFromScheduledAt(dateLike) {
  if (!dateLike) return "";
  try {
    return new Date(dateLike).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Map portal Application + optional offer to JobApplication UI status enum. */
function mapPortalToJobUiStatus(portalApp, offer) {
  if (!portalApp) return null;
  if (portalApp.status === "rejected") return "rejected";
  const offerIssued =
    offer &&
    offer.status &&
    ["sent", "generated", "accepted"].includes(offer.status);
  if (offerIssued) return "offer_issued";
  switch (portalApp.status) {
    case "applied":
      return "applied";
    case "shortlisted":
      return "shortlisted";
    case "interviewing":
      return "interview_scheduled";
    case "selected":
      return "selected";
    default:
      return "applied";
  }
}

/**
 * Merge pipeline data (Application → Interview → Offer) into plain job application objects
 * for student-facing list/detail so status matches company actions.
 */
async function enrichJobApplicationsForStudent(jobAppDocs, studentUserId) {
  const plainApps = jobAppDocs.map((doc) =>
    typeof doc?.toObject === "function" ? doc.toObject() : { ...doc },
  );

  const student = await Student.findOne({ user: studentUserId });
  if (!student || plainApps.length === 0) return plainApps;

  const internshipIds = [
    ...new Set(
      plainApps
        .map((a) => a.internship)
        .filter(Boolean)
        .map(String)
        .filter((id) => mongoose.Types.ObjectId.isValid(id)),
    ),
  ];

  if (internshipIds.length === 0) return plainApps;

  const portalApps = await Application.find({
    student: student._id,
    internship: { $in: internshipIds },
  }).lean();

  const portalByInternship = new Map(
    portalApps.map((p) => [String(p.internship), p]),
  );
  const portalMongoIds = portalApps.map((p) => p._id);
  if (portalMongoIds.length === 0) return plainApps;

  const [offerLetters, interviewGroups] = await Promise.all([
    OfferLetter.find({
      application: { $in: portalMongoIds },
      status: { $in: ["sent", "generated", "accepted"] },
    })
      .sort({ createdAt: -1 })
      .lean(),
    Interview.aggregate([
      { $match: { application: { $in: portalMongoIds } } },
      { $sort: { scheduled_at: -1 } },
      { $group: { _id: "$application", doc: { $first: "$$ROOT" } } },
    ]),
  ]);

  const offerByApplication = new Map();
  for (const o of offerLetters) {
    const k = String(o.application);
    if (!offerByApplication.has(k)) offerByApplication.set(k, o);
  }
  const interviewByApplication = new Map(
    interviewGroups.map((x) => [String(x._id), x.doc]),
  );

  return plainApps.map((plain) => {
    if (!plain.internship) return plain;
    const pa = portalByInternship.get(String(plain.internship));
    if (!pa) return plain;

    const offer = offerByApplication.get(String(pa._id));
    const uiStatus = mapPortalToJobUiStatus(pa, offer);
    if (uiStatus) plain.status = uiStatus;

    const iv = interviewByApplication.get(String(pa._id));
    if (iv?.scheduled_at || iv?.interview_date) {
      plain.interviewDate = iv.interview_date || iv.scheduled_at;
      plain.interviewTime =
        (iv.interview_time && String(iv.interview_time).trim()) ||
        formatInterviewTimeFromScheduledAt(iv.scheduled_at);
      plain.interviewLink = iv.meeting_link || plain.interviewLink;
      plain.interviewType = iv.interview_type || 'video'; // default to video for older records
      if (iv.instructions)
        plain.adminNotes = iv.instructions;
    }
    return plain;
  });
}

async function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing file
  }
}

// @desc    Create a new job application
// @route   POST /api/job-applications
// @access  Private / Student
export const createJobApplication = async (req, res) => {
  const resumePath = req.file?.path;

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      cgpa,
      yearOfStudying,
      stream,
      department,
      skills,
      jobTitle,
      internship,
    } = req.body;

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (normalizedEmail !== req.user.email.toLowerCase()) {
      await safeUnlink(resumePath);
      return res.status(403).json({
        success: false,
        message: "Email must match your logged-in account.",
      });
    }

    let parsedSkills = [];
    try {
      parsedSkills = skills ? JSON.parse(skills) : [];
      if (!Array.isArray(parsedSkills)) parsedSkills = [];
    } catch {
      await safeUnlink(resumePath);
      return res.status(400).json({
        success: false,
        message: "Invalid skills payload.",
      });
    }

    const internshipStr =
      internship !== undefined && internship !== null
        ? String(internship).trim()
        : "";

    let studentDoc = null;
    let internshipDoc = null;

    if (internshipStr) {
      if (!mongoose.Types.ObjectId.isValid(internshipStr)) {
        await safeUnlink(resumePath);
        return res.status(400).json({
          success: false,
          message: "Invalid internship reference.",
        });
      }

      internshipDoc = await Internship.findById(internshipStr);
      if (!internshipDoc) {
        await safeUnlink(resumePath);
        return res.status(400).json({
          success: false,
          message: "This internship is no longer available.",
        });
      }

      studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc) {
        if (req.user.role !== 'admin') {
          await safeUnlink(resumePath);
          return res.status(400).json({
            success: false,
            message:
              "Complete your student profile before applying to internships.",
          });
        }
      } else {
        const existingPortalApp = await Application.findOne({
          student: studentDoc._id,
          internship: internshipDoc._id,
        });
        if (existingPortalApp) {
          await safeUnlink(resumePath);
          return res.status(400).json({
            success: false,
            message:
              "You have already applied for this internship position. You cannot apply more than once.",
          });
        }
      }
    }

    const query = { email: normalizedEmail };
    if (internshipStr) {
      query.internship = internshipStr;
    } else {
      query.jobTitle = { $regex: new RegExp(`^${String(jobTitle).trim()}$`, "i") };
    }

    const existingApplication = await JobApplication.findOne(query);
    if (existingApplication) {
      await safeUnlink(resumePath);
      return res.status(400).json({
        success: false,
        message:
          "You have already applied for this internship position. You cannot apply more than once.",
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required" });
    }

    const resumeUrl = req.file.path.replace(/\\/g, "/");

    const jobApplication = new JobApplication({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      cgpa: Number(cgpa),
      yearOfStudying,
      stream,
      department,
      skills: parsedSkills,
      resumeUrl,
      jobTitle,
      internship: internshipStr || undefined,
    });

    await jobApplication.save();

    if (studentDoc && internshipDoc) {
      try {
        await Application.create({
          student: studentDoc._id,
          internship: internshipDoc._id,
          resume_version: resumeUrl,
          status: "applied",
          source: "student_apply_form",
        });
      } catch (syncErr) {
        console.error(
          "[JobApplicationController] Failed to sync Application:",
          syncErr.message,
        );
        await JobApplication.deleteOne({ _id: jobApplication._id });
        await safeUnlink(resumePath);
        return res.status(500).json({
          success: false,
          message:
            "Could not complete your application. Please try again shortly.",
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: { id: jobApplication._id, email: jobApplication.email },
    });
  } catch (err) {
    console.error(
      "[JobApplicationController] Error in createJobApplication:",
      err.message,
    );
    await safeUnlink(resumePath);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current student's job applications (with portal pipeline status merge)
// @route   GET /api/job-applications
// @access  Private / Student
export const getJobApplications = async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    const applications = await JobApplication.find({ email }).sort({
      createdAt: -1,
    });
    const data = await enrichJobApplicationsForStudent(
      applications,
      req.user._id,
    );
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error(
      "[JobApplicationController] Error in getJobApplications:",
      err.message,
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get one job application by ID (owner-only; merged with Application / Interview / Offer)
// @route   GET /api/job-applications/:id
// @access  Private / Student
export const getJobApplicationById = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Job application not found" });
    }

    if (application.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const [data] = await enrichJobApplicationsForStudent(
      [application],
      req.user._id,
    );
    res.json({ success: true, data });
  } catch (err) {
    console.error(
      "[JobApplicationController] Error in getJobApplicationById:",
      err.message,
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  createJobApplication,
  getJobApplications,
  getJobApplicationById,
};
