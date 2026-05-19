import CalendarEvent from "../models/CalendarEvent.js";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const DURATION_MINUTES = 60;

/**
 * Sync interview to Google Calendar when credentials are configured.
 * Falls back to a persisted pending record when API is unavailable.
 */
export async function syncInterviewToGoogleCalendar(interview, context = {}) {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_CALENDAR_ID = "primary",
  } = env;

  const start = new Date(interview.scheduled_at);
  const end = new Date(start.getTime() + DURATION_MINUTES * 60 * 1000);

  const summary = context.title || `Interview — Round ${interview.round_number}`;
  const description = [
    context.companyName && `Company: ${context.companyName}`,
    context.studentName && `Candidate: ${context.studentName}`,
    interview.instructions && `Instructions: ${interview.instructions}`,
    interview.meeting_link && `Meeting: ${interview.meeting_link}`,
  ]
    .filter(Boolean)
    .join("\n");

  let calendarEvent = await CalendarEvent.findOne({ interview: interview._id });

  if (!calendarEvent) {
    calendarEvent = await CalendarEvent.create({
      interview: interview._id,
      provider: "google",
      calendar_id: GOOGLE_CALENDAR_ID,
      sync_status: "pending",
    });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    logger.warn(
      "Google Calendar credentials missing — stored calendar event as pending",
    );
    calendarEvent.sync_status = "pending";
    calendarEvent.raw_response = { reason: "credentials_not_configured" };
    await calendarEvent.save();
    return { calendarEvent, synced: false };
  }

  try {
    const { google } = await import("googleapis");

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventBody = {
      summary,
      description,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees: [
        ...(context.studentEmail ? [{ email: context.studentEmail }] : []),
        ...(context.interviewerEmail ? [{ email: context.interviewerEmail }] : []),
      ].filter((a) => a.email),
      conferenceData:
        interview.interview_type === "video" && interview.meeting_link
          ? undefined
          : undefined,
      location:
        interview.interview_type === "in-person" ? interview.meeting_link : undefined,
    };

    let googleEvent;

    if (calendarEvent.external_event_id) {
      const { data } = await calendar.events.update({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: calendarEvent.external_event_id,
        requestBody: eventBody,
        sendUpdates: "all",
      });
      googleEvent = data;
    } else {
      const { data } = await calendar.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        requestBody: eventBody,
        sendUpdates: "all",
      });
      googleEvent = data;
    }

    calendarEvent.external_event_id = googleEvent.id;
    calendarEvent.html_link = googleEvent.htmlLink || "";
    calendarEvent.sync_status = "synced";
    calendarEvent.last_synced_at = new Date();
    calendarEvent.raw_response = googleEvent;
    await calendarEvent.save();

    interview.google_event_id = googleEvent.id;
    await interview.save();

    return { calendarEvent, synced: true, googleEvent };
  } catch (error) {
    logger.error(`Google Calendar sync failed: ${error.message}`);
    calendarEvent.sync_status = "failed";
    calendarEvent.raw_response = { error: error.message };
    await calendarEvent.save();
    return { calendarEvent, synced: false, error: error.message };
  }
}
