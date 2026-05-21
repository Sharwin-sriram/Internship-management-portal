import api from "../lib/axios";
import type { InterviewRecord, ShortlistedApplicationOption } from "../types/interview";

function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: T[] }).data)) {
    return (raw as { data: T[] }).data;
  }
  return [];
}

/** Legacy array response from GET /interviews?legacy=1 */
export async function listInterviewsLegacy(): Promise<InterviewRecord[]> {
  const { data } = await api.get<InterviewRecord[] | { data: InterviewRecord[] }>(
    "/interviews?legacy=1",
  );
  return unwrapList<InterviewRecord>(data);
}

export async function listInterviews(): Promise<InterviewRecord[]> {
  const { data } = await api.get<{ data: InterviewRecord[] }>("/interviews");
  return unwrapList<InterviewRecord>(data);
}

export interface ScheduleInterviewPayload {
  application_id: string;
  scheduled_at: string;
  interview_type: "phone" | "video" | "in-person";
  meeting_link?: string;
  instructions?: string;
  interviewer_id?: string | null;
  round_number?: number;
}

export async function scheduleInterview(payload: ScheduleInterviewPayload) {
  const { data } = await api.post<{ data: InterviewRecord }>("/interviews", payload);
  return data;
}

export async function acceptInterview(id: string) {
  const { data } = await api.post<{ data: InterviewRecord }>(`/interviews/${id}/accept`);
  return data;
}

export async function declineInterview(id: string, reason?: string) {
  const { data } = await api.post<{ data: InterviewRecord }>(`/interviews/${id}/decline`, {
    reason,
  });
  return data;
}

export async function requestReschedule(id: string, reason: string) {
  const { data } = await api.patch<{ data: InterviewRecord }>(`/interviews/${id}/reschedule`, {
    reason,
  });
  return data;
}

export async function patchInterviewStatus(id: string, status: string) {
  const { data } = await api.patch<{ data: InterviewRecord }>(`/interviews/${id}/status`, {
    status,
  });
  return data;
}

export async function syncGoogleCalendar(id: string) {
  const { data } = await api.post(`/interviews/${id}/calendar/sync`);
  return data;
}

export async function fetchShortlistedApplications(): Promise<ShortlistedApplicationOption[]> {
  const { data } = await api.get<{ success: boolean; data: ShortlistedApplicationOption[] }>(
    "/companies/me/shortlisted-applications",
  );
  return data.data ?? [];
}

export async function fetchRoundHistory(applicationId: string) {
  const { data } = await api.get(`/interviews/application/${applicationId}/rounds`);
  return data;
}

export function computeInterviewStats(interviews: InterviewRecord[]) {
  const total = interviews.length;
  const pending = interviews.filter((i) =>
    ["pending", "scheduled", "reschedule_requested"].includes(i.status),
  ).length;
  const completed = interviews.filter((i) => i.status === "completed").length;
  return { total, pending, completed };
}
