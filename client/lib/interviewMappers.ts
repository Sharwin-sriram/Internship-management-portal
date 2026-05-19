import type { InterviewCardProps } from "../components/interviews/InterviewCard";
import type { InterviewRecord } from "../types/interview";

type CardStatus = NonNullable<InterviewCardProps["status"]>;

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function mapStatus(s: string): CardStatus {
  if (s === "accepted") return "accepted";
  if (s === "declined") return "declined";
  if (s === "completed") return "completed";
  if (s === "rescheduled" || s === "reschedule_requested") return "rescheduled";
  return "pending";
}

export function interviewToCardProps(
  doc: InterviewRecord,
): InterviewCardProps & { id: string } {
  const app =
    typeof doc.application === "object" && doc.application
      ? doc.application
      : null;

  const scheduled = new Date(doc.scheduled_at);
  const companyName =
    (typeof doc.company === "object" && doc.company?.company_name) ||
    app?.internship?.company?.company_name ||
    "Company";

  const jobTitle = app?.internship?.title || "Interview";
  const interviewerName =
    typeof doc.interviewer_id === "object" && doc.interviewer_id?.name
      ? doc.interviewer_id.name
      : undefined;

  const isInPerson = doc.interview_type === "in-person";
  const meetingLink = !isInPerson ? doc.meeting_link : undefined;
  const location = isInPerson ? doc.meeting_link : undefined;

  return {
    id: doc._id,
    companyName,
    jobTitle,
    date: formatDate(scheduled),
    time: formatTime(scheduled),
    interviewType: doc.interview_type,
    interviewerName,
    meetingLink,
    location,
    status: mapStatus(doc.status),
  };
}

export function interviewCalendarDayKey(doc: InterviewRecord) {
  return new Date(doc.scheduled_at).toISOString().slice(0, 10);
}
