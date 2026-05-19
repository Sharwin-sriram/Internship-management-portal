"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiUser, FiCheckCircle } from "react-icons/fi";
import { FormField, Input, Select, Textarea } from "../../../../../components/ui/FormField";
import Button from "../../../../../components/ui/Button";
import Modal from "../../../../../components/ui/Modal";
import * as interviewApi from "../../../../../services/interviewApi";
import type { ShortlistedApplicationOption } from "../../../../../types/interview";
import { useProtectedRoute } from "../../../../../hooks/useProtectedRoute";
import { useToast } from "../../../../../context/ToastContext";
import { getErrorMessage } from "../../../../../lib/axios";

export default function ScheduleInterviewPage() {
  useProtectedRoute(["company"]);
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingApps, setLoadingApps] = useState(true);
  const [successModal, setSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<ShortlistedApplicationOption[]>([]);
  const [formData, setFormData] = useState({
    candidate: "",
    date: "",
    time: "",
    type: "video",
    interviewer: "",
    meetingLink: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingApps(true);
      try {
        const apps = await interviewApi.fetchShortlistedApplications();
        if (!cancelled) setApplications(apps);
      } catch {
        if (!cancelled) setApplications([]);
        showToast("Could not load shortlisted applications", "error");
      } finally {
        if (!cancelled) setLoadingApps(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scheduled_at = new Date(`${formData.date}T${formData.time}`).toISOString();
      const meeting_link =
        formData.type === "in-person" ? formData.location || "" : formData.meetingLink || "";

      await interviewApi.scheduleInterview({
        application_id: formData.candidate,
        round_number: 1,
        scheduled_at,
        interview_type: formData.type.toLowerCase() as "phone" | "video" | "in-person",
        meeting_link,
        instructions: formData.notes || "",
      });

      showToast("Interview scheduled successfully", "success");
      setSuccessModal(true);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal(false);
    router.push("/dashboard/company/calendar");
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 900, margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(34,151,250,0.1)",
            color: "#2297FA",
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "var(--space-sm)",
          }}
        >
          <FiCalendar size={14} /> Interview management
        </div>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "var(--space-xs)" }}>
          Schedule interview
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-base)", fontWeight: 500 }}>
          Shortlisted applications from your postings (API: POST /api/interviews)
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "var(--space-lg)",
            padding: "12px 16px",
            borderRadius: "var(--radius)",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#b91c1c",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-2xl)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
          <FormField label="Candidate (application)" id="candidate">
            <Select
              name="candidate"
              value={formData.candidate}
              onChange={handleChange}
              required
              disabled={loadingApps}
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-base)",
              }}
            >
              <option value="">{loadingApps ? "Loading…" : "Select a shortlisted candidate"}</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.studentName} — {a.roleTitle} ({a.status})
                </option>
              ))}
            </Select>
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-lg)" }}>
            <FormField label="Interview date" id="date">
              <div style={{ position: "relative" }}>
                <FiCalendar style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input type="date" name="date" value={formData.date} onChange={handleChange} required style={{ paddingLeft: "40px" }} />
              </div>
            </FormField>
            <FormField label="Interview time" id="time">
              <div style={{ position: "relative" }}>
                <FiClock style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input type="time" name="time" value={formData.time} onChange={handleChange} required style={{ paddingLeft: "40px" }} />
              </div>
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-lg)" }}>
            <FormField label="Interview type" id="type">
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-background)",
                  fontSize: "var(--font-size-base)",
                }}
              >
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="in-person">In-person</option>
              </Select>
            </FormField>
            <FormField label="Interviewer (display name)" id="interviewer">
              <div style={{ position: "relative" }}>
                <FiUser style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input
                  type="text"
                  name="interviewer"
                  placeholder="Optional — assign by user ID in API later"
                  value={formData.interviewer}
                  onChange={handleChange}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </FormField>
          </div>

          {formData.type === "video" && (
            <FormField label="Meeting link" id="meetingLink">
              <div style={{ position: "relative" }}>
                <FiVideo style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input
                  type="url"
                  name="meetingLink"
                  placeholder="https://meet.google.com/…"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </FormField>
          )}

          {formData.type === "in-person" && (
            <FormField label="Location" id="location">
              <div style={{ position: "relative" }}>
                <FiMapPin style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input
                  type="text"
                  name="location"
                  placeholder="Office address"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </FormField>
          )}

          {formData.type === "phone" && (
            <FormField label="Call notes / dial-in" id="meetingLink">
              <Input type="text" name="meetingLink" placeholder="Phone number or bridge details" value={formData.meetingLink} onChange={handleChange} />
            </FormField>
          )}

          <FormField label="Instructions" id="notes">
            <Textarea
              name="notes"
              placeholder="Topics to prepare, dress code, etc."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-base)",
                resize: "vertical",
              }}
            />
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-md)", paddingTop: "var(--space-md)", borderTop: "1px solid var(--color-border)" }}>
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} style={{ padding: "12px 32px", background: "#2297FA" }}>
              {loading ? "Scheduling…" : "Schedule"}
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={successModal} onClose={handleSuccessClose} size="sm" showCloseButton={false}>
        <div style={{ textAlign: "center", padding: "var(--space-lg)" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.1)",
              color: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-lg)",
            }}
          >
            <FiCheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, marginBottom: "var(--space-sm)" }}>Scheduled</h2>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-xl)" }}>
            Invitation and notifications were triggered on the server.
          </p>
          <Button variant="primary" onClick={handleSuccessClose} style={{ width: "100%", background: "#22c55e" }}>
            View calendar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
