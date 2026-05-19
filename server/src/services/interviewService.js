import mongoose from "mongoose";
import Interview from "../models/Interview.js";
import InterviewRound from "../models/InterviewRound.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import Application from "../models/Application.js";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import User from "../models/user.js";
import * as notificationService from "./notificationService.js";
import emailService from "./emailService.js";
import { syncInterviewToGoogleCalendar } from "./googleCalendarService.js";
import {
  emitInterviewScheduled,
  emitInterviewResponse,
  emitInterviewFeedback,
} from "./socketService.js";
import env from "../config/env.js";

const ACTIVE_STATUSES = [
  "pending",
  "scheduled",
  "accepted",
  "reschedule_requested",
  "rescheduled",
];

const CONFLICT_WINDOW_MS = 30 * 60 * 1000;

export async function resolveStudentFromUser(userId) {
  return Student.findOne({ user: userId });
}

export async function resolveCompanyFromUser(userId) {
  return Company.findOne({ user: userId });
}

export async function buildInterviewQueryForUser(user) {
  const role = user.role;

  if (role === "admin" || role === "coordinator") {
    return {};
  }

  if (role === "interviewer") {
    return { interviewer_id: user._id };
  }

  if (role === "student") {
    const student = await resolveStudentFromUser(user._id);
    if (!student) return { _id: null };
    return { student: student._id };
  }

  if (role === "company") {
    const company = await resolveCompanyFromUser(user._id);
    if (!company) return { _id: null };
    return { company: company._id };
  }

  return { _id: null };
}

/**
 * Detect scheduling conflicts for student or interviewer in a ±30 min window.
 */
export async function findSchedulingConflicts({
  studentId,
  interviewerId,
  scheduledAt,
  excludeInterviewId = null,
}) {
  const start = new Date(scheduledAt);
  const windowStart = new Date(start.getTime() - CONFLICT_WINDOW_MS);
  const windowEnd = new Date(start.getTime() + CONFLICT_WINDOW_MS);

  const baseQuery = {
    scheduled_at: { $gte: windowStart, $lte: windowEnd },
    status: { $in: ACTIVE_STATUSES },
  };

  if (excludeInterviewId) {
    baseQuery._id = { $ne: excludeInterviewId };
  }

  const conflicts = [];

  const studentConflict = await Interview.findOne({
    ...baseQuery,
    student: studentId,
  }).select("_id scheduled_at status");

  if (studentConflict) {
    conflicts.push({
      type: "student",
      interviewId: studentConflict._id,
      scheduled_at: studentConflict.scheduled_at,
    });
  }

  if (interviewerId) {
    const interviewerConflict = await Interview.findOne({
      ...baseQuery,
      interviewer_id: interviewerId,
    }).select("_id scheduled_at status");

    if (interviewerConflict) {
      conflicts.push({
        type: "interviewer",
        interviewId: interviewerConflict._id,
        scheduled_at: interviewerConflict.scheduled_at,
      });
    }
  }

  return conflicts;
}

export async function getInterviewContext(applicationId) {
  const application = await Application.findById(applicationId)
    .populate({
      path: "student",
      populate: { path: "user", select: "name email" },
    })
    .populate({
      path: "internship",
      populate: { path: "company", populate: { path: "user", select: "_id name email" } },
    });

  if (!application) {
    const err = new Error("Application not found");
    err.statusCode = 404;
    throw err;
  }

  if (!["shortlisted", "interviewing"].includes(application.status)) {
    const err = new Error(
      "Interviews can only be scheduled for shortlisted or interviewing applications",
    );
    err.statusCode = 400;
    throw err;
  }

  const company = application.internship?.company;
  const studentUser = application.student?.user;

  return { application, company, studentUser };
}

export async function scheduleInterview({
  scheduledByUser,
  applicationId,
  interviewerId,
  interviewType,
  scheduledAt,
  interviewDate,
  interviewTime,
  meetingLink,
  instructions,
  roundNumber,
}) {
  const { application, company, studentUser } =
    await getInterviewContext(applicationId);

  if (scheduledByUser.role === "company") {
    const userCompany = await resolveCompanyFromUser(scheduledByUser._id);
    if (
      !userCompany ||
      userCompany._id.toString() !== company?._id?.toString()
    ) {
      const err = new Error("You can only schedule interviews for your company");
      err.statusCode = 403;
      throw err;
    }
  }

  const round =
    roundNumber ||
    (await Interview.countDocuments({ application: applicationId })) + 1;

  const conflicts = await findSchedulingConflicts({
    studentId: application.student._id,
    interviewerId: interviewerId || null,
    scheduledAt,
  });

  if (conflicts.length) {
    const err = new Error("Interview scheduling conflict detected");
    err.statusCode = 409;
    err.conflicts = conflicts;
    throw err;
  }

  const interview = await Interview.create({
    student: application.student._id,
    application: applicationId,
    company: company._id,
    scheduled_by: scheduledByUser._id,
    round_number: round,
    scheduled_at: scheduledAt,
    interview_date: interviewDate || scheduledAt,
    interview_time: interviewTime || "",
    interview_type: interviewType,
    interviewer_id: interviewerId || null,
    meeting_link: meetingLink || "",
    instructions: instructions || "",
    status: "pending",
    invitation_sent_at: new Date(),
  });

  await InterviewRound.create({
    application: applicationId,
    interview: interview._id,
    round_number: round,
    outcome: "pending",
  });

  application.status = "interviewing";
  await application.save();

  const companyUserId = company.user?._id || company.user;
  const studentUserId = studentUser?._id || studentUser;

  const notifyPayload = {
    interviewId: interview._id,
    applicationId,
    round_number: round,
    scheduled_at: interview.scheduled_at,
    interview_type: interview.interview_type,
    meeting_link: interview.meeting_link,
  };

  await notificationService.createInAppNotification({
    userIds: [studentUserId],
    event_type: "interview_invitation",
    title: "New interview invitation",
    message: `${company.company_name || "A company"} invited you to a ${interviewType} interview (Round ${round}).`,
    action_url: `${env.FRONTEND_URL}/dashboard/student/interviews`,
    payload: notifyPayload,
  });

  if (companyUserId) {
    await notificationService.createInAppNotification({
      userIds: [companyUserId],
      event_type: "interview_scheduled",
      title: "Interview scheduled",
      message: `Round ${round} interview scheduled with ${studentUser?.name || "candidate"}.`,
      action_url: `${env.FRONTEND_URL}/dashboard/company/calendar`,
      payload: notifyPayload,
    });
  }

  if (interviewerId) {
    await notificationService.createInAppNotification({
      userIds: [interviewerId],
      event_type: "interview_assigned",
      title: "Interview assignment",
      message: `You are assigned as interviewer for Round ${round}.`,
      action_url: `${env.FRONTEND_URL}/dashboard/interviewer/feedback`,
      payload: notifyPayload,
    });
  }

  let interviewerUser = null;
  if (interviewerId) {
    interviewerUser = await User.findById(interviewerId).select("name email");
  }

  await emailService.sendInterviewInvitation({
    to: studentUser?.email,
    studentName: studentUser?.name,
    companyName: company.company_name,
    interview,
    meetingLink: meetingLink,
    instructions,
  });

  interview.status = "scheduled";
  await interview.save();

  emitInterviewScheduled(companyUserId, studentUserId, {
    ...notifyPayload,
    status: interview.status,
  });

  await syncInterviewToGoogleCalendar(interview, {
    title: `${company.company_name} — Round ${round}`,
    companyName: company.company_name,
    studentName: studentUser?.name,
    studentEmail: studentUser?.email,
    interviewerEmail: interviewerUser?.email,
  });

  return populateInterview(interview._id);
}

export async function populateInterview(interviewId) {
  return Interview.findById(interviewId)
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
    .populate("student")
    .populate("company", "company_name");
}

export async function respondToInterview({
  interviewId,
  studentUser,
  action,
  reason = "",
}) {
  const student = await resolveStudentFromUser(studentUser._id);
  if (!student) {
    const err = new Error("Student profile not found");
    err.statusCode = 404;
    throw err;
  }

  const interview = await Interview.findById(interviewId).populate({
    path: "company",
    populate: { path: "user", select: "_id name email" },
  });

  if (!interview || interview.student.toString() !== student._id.toString()) {
    const err = new Error("Interview not found");
    err.statusCode = 404;
    throw err;
  }

  const statusMap = {
    accept: "accepted",
    decline: "declined",
    reschedule: "reschedule_requested",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    const err = new Error("Invalid action");
    err.statusCode = 400;
    throw err;
  }

  if (!["pending", "scheduled"].includes(interview.status) && action !== "reschedule") {
    const err = new Error(`Cannot ${action} interview in status: ${interview.status}`);
    err.statusCode = 400;
    throw err;
  }

  interview.status = newStatus;
  if (action === "reschedule") {
    interview.reschedule_reason = reason;
    interview.reschedule_requested_at = new Date();
  }
  await interview.save();

  const companyUserId = interview.company?.user?._id || interview.company?.user;

  const titles = {
    accept: "Interview accepted",
    decline: "Interview declined",
    reschedule: "Reschedule requested",
  };

  await notificationService.createInAppNotification({
    userIds: [companyUserId],
    event_type: `interview_${action}`,
    title: titles[action],
    message:
      action === "reschedule"
        ? `Student requested reschedule: ${reason}`
        : `Student ${action}ed the interview (Round ${interview.round_number}).`,
    action_url: `${env.FRONTEND_URL}/dashboard/company/calendar`,
    payload: { interviewId: interview._id, status: newStatus, reason },
  });

  emitInterviewResponse(companyUserId, {
    interviewId: interview._id,
    action,
    status: newStatus,
    reason,
  });

  if (companyUserId) {
    const companyId = interview.company?._id || interview.company;
    const company = await Company.findById(companyId).populate(
      "user",
      "email name",
    );
    await emailService.sendInterviewResponseNotice({
      to: company?.user?.email || company?.primary_contact?.email,
      companyName: company?.company_name,
      action,
      interview,
      reason,
    });
  }

  return populateInterview(interview._id);
}

/** Legacy PATCH /status support for frontend */
export async function updateInterviewStatus(interviewId, status, user) {
  if (user.role === "student") {
    if (status === "accepted") {
      return respondToInterview({
        interviewId,
        studentUser: user,
        action: "accept",
      });
    }
    if (status === "declined") {
      return respondToInterview({
        interviewId,
        studentUser: user,
        action: "decline",
      });
    }
  }

  const query = await buildInterviewQueryForUser(user);
  const interview = await Interview.findOne({ _id: interviewId, ...query });

  if (!interview) {
    const err = new Error("Interview not found");
    err.statusCode = 404;
    throw err;
  }

  const allowed = [
    "scheduled",
    "accepted",
    "declined",
    "reschedule_requested",
    "rescheduled",
    "completed",
    "cancelled",
  ];

  if (!allowed.includes(status)) {
    const err = new Error("Invalid status");
    err.statusCode = 400;
    throw err;
  }

  interview.status = status;
  await interview.save();
  return populateInterview(interview._id);
}

export async function advanceToNextRound({
  interviewId,
  companyUser,
  nextRoundPayload,
}) {
  const company = await resolveCompanyFromUser(companyUser._id);
  const current = await Interview.findById(interviewId);

  if (!current || current.company.toString() !== company._id.toString()) {
    const err = new Error("Interview not found");
    err.statusCode = 404;
    throw err;
  }

  await InterviewRound.findOneAndUpdate(
    { application: current.application, round_number: current.round_number },
    {
      outcome: "passed",
      advanced_by: companyUser._id,
      advanced_at: new Date(),
    },
  );

  const nextRound = current.round_number + 1;

  return scheduleInterview({
    scheduledByUser: companyUser,
    applicationId: current.application,
    roundNumber: nextRound,
    ...nextRoundPayload,
  });
}

export async function getRoundHistory(applicationId) {
  return InterviewRound.find({ application: applicationId })
    .sort({ round_number: 1 })
    .populate({
      path: "interview",
      populate: [
        { path: "interviewer_id", select: "name email" },
        { path: "student", populate: { path: "user", select: "name email" } },
      ],
    });
}

export async function submitInterviewFeedback({
  interviewId,
  interviewerUser,
  feedbackData,
}) {
  const interview = await Interview.findById(interviewId).populate({
    path: "company",
    populate: { path: "user", select: "_id" },
  });

  if (!interview) {
    const err = new Error("Interview not found");
    err.statusCode = 404;
    throw err;
  }

  const allowedRoles = ["interviewer", "company", "coordinator", "admin"];
  if (!allowedRoles.includes(interviewerUser.role)) {
    const err = new Error("Not authorized to submit feedback");
    err.statusCode = 403;
    throw err;
  }

  if (
    interviewerUser.role === "interviewer" &&
    interview.interviewer_id?.toString() !== interviewerUser._id.toString()
  ) {
    const err = new Error("You are not assigned to this interview");
    err.statusCode = 403;
    throw err;
  }

  const existing = await InterviewFeedback.findOne({ interview: interviewId });
  if (existing) {
    const err = new Error("Feedback already submitted for this interview");
    err.statusCode = 400;
    throw err;
  }

  const {
    technical_skills,
    communication,
    problem_solving,
    confidence,
    comments,
    recommendation,
    rubric_scores,
  } = feedbackData;

  const feedback = await InterviewFeedback.create({
    interview: interviewId,
    interviewer_id: interviewerUser._id,
    technical_skills,
    communication,
    problem_solving,
    confidence,
    comments: comments || "",
    recommendation,
    rubric_scores: rubric_scores || {},
    released_to_student: false,
  });

  const avgScore =
    (technical_skills + communication + problem_solving + confidence) / 4;

  interview.feedback_score = Math.round(avgScore * 10) / 10;
  interview.status = "completed";
  await interview.save();

  await InterviewRound.findOneAndUpdate(
    { interview: interviewId },
    { outcome: "passed" },
  );

  const companyUserId = interview.company?.user?._id || interview.company?.user;

  emitInterviewFeedback(companyUserId, true, {
    interviewId,
    feedbackId: feedback._id,
  });

  await notificationService.createInAppNotification({
    userIds: [companyUserId],
    event_type: "interview_feedback",
    title: "Interview feedback submitted",
    message: `Feedback recorded for Round ${interview.round_number}.`,
    action_url: `${env.FRONTEND_URL}/dashboard/company/calendar`,
    payload: { interviewId, feedbackId: feedback._id },
  });

  return { interview: await populateInterview(interviewId), feedback };
}

export async function getInterviewFeedback(interviewId, user) {
  const feedback = await InterviewFeedback.findOne({
    interview: interviewId,
  }).populate("interviewer_id", "name email");

  if (!feedback) {
    const err = new Error("Feedback not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "student") {
    if (!feedback.released_to_student) {
      const err = new Error("Feedback not yet released");
      err.statusCode = 403;
      throw err;
    }
  } else if (!["company", "coordinator", "admin", "interviewer"].includes(user.role)) {
    const err = new Error("Access denied");
    err.statusCode = 403;
    throw err;
  }

  return feedback;
}

export async function releaseFeedbackToStudent(interviewId) {
  const feedback = await InterviewFeedback.findOneAndUpdate(
    { interview: interviewId },
    { released_to_student: true },
    { new: true },
  );

  if (!feedback) {
    const err = new Error("Feedback not found");
    err.statusCode = 404;
    throw err;
  }

  const interview = await Interview.findById(interviewId).populate({
    path: "student",
    populate: { path: "user", select: "_id" },
  });

  if (interview?.student?.user) {
    await notificationService.createInAppNotification({
      userIds: [interview.student.user._id],
      event_type: "feedback_released",
      title: "Interview feedback available",
      message: "Your interview feedback has been released.",
      action_url: `${env.FRONTEND_URL}/dashboard/student/interviews`,
      payload: { interviewId },
    });
  }

  return feedback;
}
