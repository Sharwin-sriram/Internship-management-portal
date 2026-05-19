"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField, Textarea, Select } from "../../../../components/ui/FormField";
import Button from "../../../../components/ui/Button";
import * as feedbackApi from "../../../../services/feedbackApi";
import * as interviewApi from "../../../../services/interviewApi";
import { useProtectedRoute } from "../../../../hooks/useProtectedRoute";
import { useToast } from "../../../../context/ToastContext";
import { getErrorMessage } from "../../../../lib/axios";

const RangeSlider = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) => (
  <div style={{ marginBottom: "var(--space-md)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
      <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", fontWeight: 700 }}>
        {value} / 10
      </span>
    </div>
    <input
      type="range"
      min={1}
      max={10}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      style={{ width: "100%", accentColor: "var(--color-primary)", cursor: "pointer" }}
    />
  </div>
);

export default function InterviewFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-xl)", textAlign: "center" }}>Loading…</div>
      }
    >
      <InterviewFeedbackInner />
    </Suspense>
  );
}

function InterviewFeedbackInner() {
  useProtectedRoute(["interviewer", "company", "coordinator", "admin"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interview") || searchParams.get("id") || "";
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [meta, setMeta] = useState<{ candidate: string; role: string }>({ candidate: "", role: "" });
  const [ratings, setRatings] = useState({
    technical: 5,
    communication: 5,
    problemSolving: 5,
    confidence: 5,
  });
  const [recommendation, setRecommendation] = useState("Hold");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (!interviewId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await interviewApi.listInterviewsLegacy();
        const doc = list.find((i: { _id: string }) => i._id === interviewId);
        if (!doc || cancelled) return;
        const app = typeof doc.application === "object" && doc.application ? doc.application : null;
        setMeta({
          candidate: app?.student?.user?.name || "Candidate",
          role: app?.internship?.title || "Role",
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewId) {
      showToast("Missing interview id — open this page with ?interview=<id>", "error");
      return;
    }
    setLoading(true);
    try {
      await feedbackApi.submitFeedback(interviewId, {
        technical_skills: ratings.technical,
        communication: ratings.communication,
        problem_solving: ratings.problemSolving,
        confidence: ratings.confidence,
        comments,
        recommendation: feedbackApi.mapRecommendationUiToApi(recommendation),
      });
      setSuccess(true);
      showToast("Feedback submitted", "success");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "var(--space-2xl) 0", textAlign: "center" }}>
        <h2 style={{ marginBottom: "var(--space-md)" }}>Feedback submitted</h2>
        <p style={{ color: "var(--color-muted)" }}>Redirecting…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-xl) 0" }}>
      <div style={{ marginBottom: "var(--space-xl)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-md)" }}>
        <h1 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-xs)" }}>Interview evaluation</h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-md)" }}>
          Candidate: <strong>{meta.candidate}</strong> | Role: <strong>{meta.role}</strong>
        </p>
        {!interviewId && (
          <p style={{ color: "#b91c1c", marginTop: 8, fontSize: "var(--font-size-sm)" }}>
            Add <code>?interview=&lt;mongoId&gt;</code> to the URL (POST /api/interviews/:id/feedback).
          </p>
        )}
      </div>

      <div
        style={{
          background: "white",
          padding: "var(--space-xl)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-lg)" }}>Skills assessment</h3>
            <RangeSlider label="Technical skills" value={ratings.technical} onChange={(v) => setRatings({ ...ratings, technical: v })} />
            <RangeSlider label="Communication" value={ratings.communication} onChange={(v) => setRatings({ ...ratings, communication: v })} />
            <RangeSlider label="Problem solving" value={ratings.problemSolving} onChange={(v) => setRatings({ ...ratings, problemSolving: v })} />
            <RangeSlider label="Confidence" value={ratings.confidence} onChange={(v) => setRatings({ ...ratings, confidence: v })} />
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", margin: "var(--space-md) 0" }} />

          <FormField label="Recommendation" id="recommendation">
            <Select name="recommendation" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} required>
              <option value="Selected">Strong hire</option>
              <option value="Hold">Neutral / hold</option>
              <option value="Rejected">No hire</option>
            </Select>
          </FormField>

          <FormField label="Comments" id="comments">
            <Textarea name="comments" placeholder="Observations…" value={comments} onChange={(e) => setComments(e.target.value)} rows={6} required />
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-md)", marginTop: "var(--space-md)" }}>
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Submit feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
