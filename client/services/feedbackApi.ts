import api from "../lib/axios";

export interface FeedbackPayload {
  technical_skills: number;
  communication: number;
  problem_solving: number;
  confidence: number;
  comments: string;
  recommendation:
    | "strong_hire"
    | "hire"
    | "neutral"
    | "no_hire"
    | "strong_no_hire";
  rubric_scores?: Record<string, number>;
}

export async function submitFeedback(interviewId: string, payload: FeedbackPayload) {
  const { data } = await api.post(`/interviews/${interviewId}/feedback`, payload);
  return data;
}

export async function getFeedback(interviewId: string) {
  const { data } = await api.get(`/interviews/${interviewId}/feedback`);
  return data;
}

export async function releaseFeedbackToStudent(interviewId: string) {
  const { data } = await api.patch(`/interviews/${interviewId}/feedback/release`);
  return data;
}

/** Map UI dropdown values to API enum */
export function mapRecommendationUiToApi(ui: string): FeedbackPayload["recommendation"] {
  const m: Record<string, FeedbackPayload["recommendation"]> = {
    Selected: "strong_hire",
    Hold: "neutral",
    Rejected: "strong_no_hire",
  };
  return m[ui] ?? "neutral";
}
