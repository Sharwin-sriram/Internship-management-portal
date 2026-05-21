import JobApplication from "../models/JobApplication.js";

// @desc    Create a new job application
// @route   POST /api/job-applications
// @access  Private
export const createJobApplication = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, cgpa, yearOfStudying, stream, department, skills, jobTitle, internship
    } = req.body;

    // Parse skills (sent as JSON string from form)
    const parsedSkills = skills ? JSON.parse(skills) : [];

    // Prevent duplicate applications for the same job position by the same student
    const query = { email: email.toLowerCase() };
    if (internship) {
      query.internship = internship;
    } else {
      query.jobTitle = { $regex: new RegExp(`^${jobTitle.trim()}$`, "i") };
    }

    const existingApplication = await JobApplication.findOne(query);
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this internship position. You cannot apply more than once."
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    const application = new JobApplication({
      firstName,
      lastName,
      email,
      phone,
      cgpa: Number(cgpa),
      yearOfStudying,
      stream,
      department,
      skills: parsedSkills,
      resumeUrl: req.file.path.replace(/\\/g, '/'), // Ensure path format is normalized
      jobTitle,
      internship: internship || undefined
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: { id: application._id, email: application.email },
    });
  } catch (err) {
    console.error("[JobApplicationController] Error in createJobApplication:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all job applications
// @route   GET /api/job-applications
// @access  Private
export const getJobApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    console.error("[JobApplicationController] Error in getJobApplications:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single job application by ID
// @route   GET /api/job-applications/:id
// @access  Private
export const getJobApplicationById = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Job application not found" });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    console.error("[JobApplicationController] Error in getJobApplicationById:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  createJobApplication,
  getJobApplications,
  getJobApplicationById
};
