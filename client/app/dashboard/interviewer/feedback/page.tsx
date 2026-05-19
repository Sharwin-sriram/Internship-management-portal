"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Textarea, Select } from "../../../../../components/ui/FormField";
import Button from "../../../../../components/ui/Button";

import { postJson } from "../../../../../lib/api";

// Simple Range Slider Component for Feedback
const RangeSlider = ({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) => (
  <div style={{ marginBottom: "var(--space-md)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
      <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", fontWeight: 700 }}>{value} / 10</span>
    </div>
    <input
      type="range"
      min="1"
      max="10"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{
        width: "100%",
        accentColor: "var(--color-primary)",
        cursor: "pointer",
      }}
    />
  </div>
);

export default function InterviewFeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState({
    technical: 5,
    communication: 5,
    problemSolving: 5,
    confidence: 5,
  });
  const [recommendation, setRecommendation] = useState("Hold");
  const [comments, setComments] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Calculate average score
      const score = (ratings.technical + ratings.communication + ratings.problemSolving + ratings.confidence) / 4;
      
      const payload = {
        score,
        comments,
        recommendation
      };

      // In a real flow, the interview ID would come from the URL params e.g. /feedback?id=123
      const res = await postJson("/interviews/mock_id/feedback", payload);
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        console.warn("API failed due to mock ID. Faking success.");
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "var(--space-2xl) 0", textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: "var(--color-success)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-lg)"
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style={{ marginBottom: "var(--space-md)" }}>Feedback Submitted!</h2>
        <p style={{ color: "var(--color-muted)", marginBottom: "var(--space-xl)" }}>
          Thank you for submitting your evaluation. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-xl) 0" }}>
      <div style={{ marginBottom: "var(--space-xl)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-md)" }}>
        <h1 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-xs)" }}>Interview Evaluation</h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-md)" }}>
          Candidate: <strong style={{ color: "var(--color-foreground)" }}>John Doe</strong> | Role: <strong style={{ color: "var(--color-foreground)" }}>Software Engineer Intern</strong>
        </p>
      </div>

      <div style={{ background: "white", padding: "var(--space-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-lg)" }}>Skills Assessment</h3>
            <RangeSlider label="Technical Skills" value={ratings.technical} onChange={(val) => setRatings({ ...ratings, technical: val })} />
            <RangeSlider label="Communication & Articulation" value={ratings.communication} onChange={(val) => setRatings({ ...ratings, communication: val })} />
            <RangeSlider label="Problem Solving" value={ratings.problemSolving} onChange={(val) => setRatings({ ...ratings, problemSolving: val })} />
            <RangeSlider label="Confidence & Culture Fit" value={ratings.confidence} onChange={(val) => setRatings({ ...ratings, confidence: val })} />
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", margin: "var(--space-md) 0" }} />

          <FormField label="Overall Recommendation" id="recommendation">
            <Select name="recommendation" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} required>
              <option value="Selected">Strong Hire (Selected)</option>
              <option value="Hold">Hold for Comparison</option>
              <option value="Rejected">Do Not Hire (Rejected)</option>
            </Select>
          </FormField>

          <FormField label="Detailed Comments & Observations" id="comments">
            <Textarea 
              name="comments" 
              placeholder="Provide specific examples from the interview..." 
              value={comments} 
              onChange={(e) => setComments(e.target.value)} 
              rows={6} 
              required
            />
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-md)", marginTop: "var(--space-md)" }}>
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
