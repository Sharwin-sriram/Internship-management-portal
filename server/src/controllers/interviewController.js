import Interview from "../models/Interview.js";
import Application from "../models/Application.js";

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Private (Company/Coordinator)
export const createInterview = async (req, res) => {
  try {
    const { application, round_number, scheduled_at, type, interviewer_id } = req.body;

    // Validate if application exists
    const existingApp = await Application.findById(application);
    if (!existingApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    const newInterview = await Interview.create({
      application,
      round_number: round_number || 1,
      scheduled_at,
      type: type.toLowerCase(),
      interviewer_id: interviewer_id || null,
      status: "scheduled",
    });

    // Optionally update application status to 'interviewing'
    existingApp.status = "interviewing";
    await existingApp.save();

    res.status(201).json(newInterview);
  } catch (error) {
    console.error("Error creating interview:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all interviews (filtered by role)
// @route   GET /api/interviews
// @access  Private
export const getInterviews = async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = {};

    // Assuming population to get student and company details
    // For a robust system, we would query based on the user's ID
    // e.g., if student: query = { 'application.student': req.user.id }
    // Since we don't have deep joins here easily without aggregate, we'll return all for now or basic filter
    
    // For interviewer role, filter by interviewer_id
    if (userRole === "interviewer") {
      query.interviewer_id = req.user.id;
    }

    const interviews = await Interview.find(query)
      .populate({
        path: "application",
        populate: [
          { path: "student", select: "name email" },
          { path: "internship", select: "title company", populate: { path: "company", select: "name" } }
        ]
      })
      .populate("interviewer_id", "name email");

    res.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update interview status
// @route   PATCH /api/interviews/:id/status
// @access  Private
export const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["scheduled", "completed", "cancelled", "rescheduled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const interview = await Interview.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (error) {
    console.error("Error updating interview status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Submit feedback
// @route   POST /api/interviews/:id/feedback
// @access  Private (Interviewer/Company/Coordinator)
export const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comments, recommendation } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.feedback_score = score;
    interview.status = "completed"; // Automatically mark completed when feedback given
    // we would save comments/recommendation if the schema had those fields. 
    // we will save what we can.

    await interview.save();

    res.json(interview);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
