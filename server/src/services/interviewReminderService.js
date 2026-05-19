import Interview from "../models/Interview.js";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import User from "../models/user.js";
import * as notificationService from "./notificationService.js";
import emailService from "./emailService.js";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const REMINDER_WINDOWS = [
  { key: "hours_24", hours: 24, toleranceMinutes: 20 },
  { key: "hours_1", hours: 1, toleranceMinutes: 10 },
];

const ACTIVE_STATUSES = ["scheduled", "accepted"];

/**
 * Process interview reminders (24h and 1h before).
 * Intended to run on a cron schedule every 15 minutes.
 */
export async function processInterviewReminders() {
  const now = Date.now();
  let sentCount = 0;

  for (const window of REMINDER_WINDOWS) {
    const targetMs = window.hours * 60 * 60 * 1000;
    const toleranceMs = window.toleranceMinutes * 60 * 1000;
    const rangeStart = new Date(now + targetMs - toleranceMs);
    const rangeEnd = new Date(now + targetMs + toleranceMs);

    const flagField = `reminders_sent.${window.key}`;

    const interviews = await Interview.find({
      scheduled_at: { $gte: rangeStart, $lte: rangeEnd },
      status: { $in: ACTIVE_STATUSES },
      [flagField]: { $ne: true },
    })
      .populate({
        path: "student",
        populate: { path: "user", select: "name email _id" },
      })
      .populate({
        path: "company",
        populate: { path: "user", select: "name email _id" },
      })
      .populate("interviewer_id", "name email");

    for (const interview of interviews) {
      const recipients = [];

      if (interview.student?.user) {
        recipients.push({
          userId: interview.student.user._id,
          email: interview.student.user.email,
          name: interview.student.user.name,
          role: "student",
        });
      }

      if (interview.company?.user) {
        recipients.push({
          userId: interview.company.user._id,
          email: interview.company.user.email,
          name: interview.company.user.name,
          role: "company",
        });
      }

      if (interview.interviewer_id) {
        recipients.push({
          userId: interview.interviewer_id._id,
          email: interview.interviewer_id.email,
          name: interview.interviewer_id.name,
          role: "interviewer",
        });
      }

      for (const recipient of recipients) {
        await notificationService.createInAppNotification({
          userIds: [recipient.userId],
          event_type: "interview_reminder",
          title: `Interview in ${window.hours} hour(s)`,
          message: `Reminder: Round ${interview.round_number} interview at ${new Date(interview.scheduled_at).toLocaleString()}.`,
          action_url:
            recipient.role === "student"
              ? `${env.FRONTEND_URL}/dashboard/student/interviews`
              : `${env.FRONTEND_URL}/dashboard/company/calendar`,
          payload: {
            interviewId: interview._id,
            hoursBefore: window.hours,
          },
        });

        await emailService.sendInterviewReminder({
          to: recipient.email,
          name: recipient.name,
          interview,
          hoursBefore: window.hours,
        });
      }

      interview.reminders_sent = interview.reminders_sent || {};
      interview.reminders_sent[window.key] = true;
      await interview.save();
      sentCount += 1;
    }
  }

  if (sentCount > 0) {
    logger.info(`Processed reminders for ${sentCount} interview window(s)`);
  }

  return { processed: sentCount };
}
