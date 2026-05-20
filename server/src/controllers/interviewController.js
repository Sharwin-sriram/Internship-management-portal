import * as interviewService from "../services/interviewService.js";
import { syncInterviewToGoogleCalendar } from "../services/googleCalendarService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

function parseScheduledAt(body) {
  if (body.scheduled_at) {
    return new Date(body.scheduled_at);
  }
  if (body.date && body.time) {
    return new Date(`${body.date}T${body.time}`);
  }
  if (body.interview_date && body.interview_time) {
    return new Date(`${body.interview_date}T${body.interview_time}`);
  }
  return null;
}

function parseInterviewType(body) {
  const raw = body.interview_type || body.type || "video";
  const normalized = String(raw).toLowerCase();
  const map = {
    video: "video",
    phone: "phone",
    "in-person": "in-person",
    inperson: "in-person",
    technical: "video",
    hr: "video",
    managerial: "video",
    assignment: "video",
  };
  return map[normalized] || "video";
}

function handleServiceError(res, error) {
  logger.error(error.message);
  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: error.message,
    ...(error.conflicts && { conflicts: error.conflicts }),
  });
}

// POST /api/interviews
export const scheduleInterview = async (req, res) => {
  try {
    const applicationId = req.body.application_id || req.body.application;
    const scheduledAt = parseScheduledAt(req.body);

    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return sendError(res, { message: "Invalid date or time" }, 400);
    }

    const interview = await interviewService.scheduleInterview({
      scheduledByUser: req.user,
      applicationId,
      interviewerId: req.body.interviewer_id || null,
      interviewType: parseInterviewType(req.body),
      scheduledAt,
      interviewDate: req.body.interview_date || req.body.date || scheduledAt,
      interviewTime: req.body.interview_time || req.body.time || "",
      meetingLink: req.body.meeting_link || "",
      instructions: req.body.instructions || req.body.notes || "",
      roundNumber: req.body.round_number,
    });

    return sendSuccess(res, { data: interview }, 201);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// GET /api/interviews
export const getInterviews = async (req, res) => {
  try {
    const query = await interviewService.buildInterviewQueryForUser(req.user);
    const Interview = (await import("../models/Interview.js")).default;

    const interviews = await Interview.find(query)
      .populate({
        path: "application",
        populate: [
          {
            path: "student",
            populate: { path: "user", select: "name email" },
          },
          {
            path: "internship",
            select: "title",
            populate: { path: "company", select: "company_name" },
          },
        ],
      })
      .populate("interviewer_id", "name email")
      .populate("company", "company_name")
      .sort({ scheduled_at: -1 });

    if (req.query.legacy === "1") {
      return res.json(interviews);
    }

    return sendSuccess(res, { data: interviews });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// GET /api/interviews/:id
export const getInterviewById = async (req, res) => {
  try {
    const query = await interviewService.buildInterviewQueryForUser(req.user);
    const Interview = (await import("../models/Interview.js")).default;

    const interview = await Interview.findOne({
      _id: req.params.id,
      ...query,
    })
      .populate({
        path: "application",
        populate: [
          { path: "student", populate: { path: "user", select: "name email" } },
          { path: "internship", select: "title" },
        ],
      })
      .populate("interviewer_id", "name email")
      .populate("company", "company_name");

    if (!interview) {
      return sendError(res, { message: "Interview not found" }, 404);
    }

    return sendSuccess(res, { data: interview });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// PATCH /api/interviews/:id/status
export const updateInterviewStatus = async (req, res) => {
  try {
    const interview = await interviewService.updateInterviewStatus(
      req.params.id,
      req.body.status,
      req.user,
    );
    return sendSuccess(res, { data: interview });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// POST /api/interviews/:id/complete
export const completeInterview = async (req, res) => {
  try {
    const decision = req.body.decision;
    const notes = req.body.notes || "";
    const interview = await interviewService.completeInterviewWithDecision({
      interviewId: req.params.id,
      companyUser: req.user,
      decision,
      notes,
    });
    return sendSuccess(res, { data: interview });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// POST /api/interviews/:id/accept
export const acceptInterview = async (req, res) => {
  try {
    const interview = await interviewService.respondToInterview({
      interviewId: req.params.id,
      studentUser: req.user,
      action: "accept",
    });
    return sendSuccess(res, { data: interview });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// POST /api/interviews/:id/decline
export const declineInterview = async (req, res) => {
  try {
    const interview = await interviewService.respondToInterview({
      interviewId: req.params.id,
      studentUser: req.user,
      action: "decline",
      reason: req.body.reason || "",
    });
    return sendSuccess(res, { data: interview });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// PATCH /api/interviews/:id/reschedule
export const requestReschedule = async (req, res) => {
  try {
    const interview = await interviewService.respondToInterview({
      interviewId: req.params.id,
      studentUser: req.user,
      action: "reschedule",
      reason: req.body.reason,
    });
    return sendSuccess(res, { data: interview });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// PATCH /api/interviews/:id/reschedule-company
export const rescheduleInterviewCompany = async (req, res) => {
  try {
    const scheduledAt = parseScheduledAt(req.body);
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return sendError(res, { message: "Invalid date or time" }, 400);
    }

    const interview = await interviewService.rescheduleInterviewByCompany({
      interviewId: req.params.id,
      companyUser: req.user,
      scheduledAt,
      interviewDate: req.body.interview_date || req.body.date || scheduledAt,
      interviewTime: req.body.interview_time || req.body.time || "",
      meetingLink: req.body.meeting_link || "",
      instructions: req.body.instructions || "",
      interviewerId: req.body.interviewer_id || null,
    });

    return sendSuccess(res, { data: interview });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// POST /api/interviews/:id/advance-round
export const advanceRound = async (req, res) => {
  try {
    const scheduledAt = parseScheduledAt(req.body);
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return sendError(res, { message: "Invalid date or time for next round" }, 400);
    }

    const interview = await interviewService.advanceToNextRound({
      interviewId: req.params.id,
      companyUser: req.user,
      nextRoundPayload: {
        interviewerId: req.body.interviewer_id,
        interviewType: parseInterviewType(req.body),
        scheduledAt,
        interviewDate: req.body.interview_date || scheduledAt,
        interviewTime: req.body.interview_time || "",
        meetingLink: req.body.meeting_link || "",
        instructions: req.body.instructions || "",
      },
    });

    return sendSuccess(res, { data: interview }, 201);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// GET /api/interviews/application/:applicationId/rounds
export const getRoundHistory = async (req, res) => {
  try {
    const rounds = await interviewService.getRoundHistory(
      req.params.applicationId,
    );
    return sendSuccess(res, { data: rounds });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// POST /api/interviews/:id/feedback
export const submitFeedback = async (req, res) => {
  try {
    const body = req.body;
    const result = await interviewService.submitInterviewFeedback({
      interviewId: req.params.id,
      interviewerUser: req.user,
      feedbackData: {
        technical_skills: body.technical_skills ?? body.technical ?? body.score ?? 5,
        communication: body.communication ?? 5,
        problem_solving: body.problem_solving ?? body.problemSolving ?? 5,
        confidence: body.confidence ?? 5,
        comments: body.comments || "",
        recommendation: body.recommendation || "neutral",
        rubric_scores: body.rubric_scores || {},
      },
    });
    return sendSuccess(res, { data: result }, 201);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// GET /api/interviews/:id/feedback
export const getFeedback = async (req, res) => {
  try {
    const feedback = await interviewService.getInterviewFeedback(
      req.params.id,
      req.user,
    );
    return sendSuccess(res, { data: feedback });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// PATCH /api/interviews/:id/feedback/release
export const releaseFeedback = async (req, res) => {
  try {
    const feedback = await interviewService.releaseFeedbackToStudent(
      req.params.id,
    );
    return sendSuccess(res, { data: feedback });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// POST /api/interviews/:id/calendar/sync
export const syncCalendar = async (req, res) => {
  try {
    const interview = await interviewService.populateInterview(req.params.id);
    if (!interview) {
      return sendError(res, { message: "Interview not found" }, 404);
    }

    const studentUser = interview.application?.student?.user;
    const result = await syncInterviewToGoogleCalendar(interview, {
      companyName: interview.company?.company_name,
      studentName: studentUser?.name,
      studentEmail: studentUser?.email,
      interviewerEmail: interview.interviewer_id?.email,
    });

    return sendSuccess(res, { data: result });
  } catch (error) {
    return handleServiceError(res, error);
  }
};
