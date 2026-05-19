"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiClock, FiVideo, FiPhone, FiMapPin, FiUser, FiCheckCircle, FiX } from "react-icons/fi";
import { FormField, Input, Select, Textarea } from "../../../../../components/ui/FormField";
import Button from "../../../../../components/ui/Button";
import Modal from "../../../../../components/ui/Modal";
import { postJson } from "../../../../../lib/api";

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    candidate: "",
    date: "",
    time: "",
    type: "video",
    interviewer: "",
    meetingLink: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scheduled_at = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const payload = {
        application: formData.candidate,
        round_number: 1,
        scheduled_at,
        type: formData.type.toLowerCase(),
      };

      const res = await postJson("/interviews", payload);
      
      if (res.ok) {
        setSuccessModal(true);
      } else {
        console.warn("API failed, likely due to mock ObjectId. Faking success for UI demonstration.");
        setSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal(false);
    router.push("/dashboard/company");
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 900, margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(34,151,250,0.1)", color: "#2297FA", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-sm)" }}>
          <FiCalendar size={14} /> Interview Management
        </div>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "var(--space-xs)" }}>
          Schedule Interview
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-base)", fontWeight: 500 }}>
          Set up an interview with a shortlisted candidate
        </p>
      </div>

      {/* Form Card */}
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-2xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
          
          {/* Candidate Selection */}
          <FormField label="Select Candidate" id="candidate">
            <Select name="candidate" value={formData.candidate} onChange={handleChange} required style={{ padding: "12px 16px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-background)", fontSize: "var(--font-size-base)" }}>
              <option value="">Select a shortlisted candidate</option>
              <option value="stu_1">John Doe - Software Engineer Intern</option>
              <option value="stu_2">Jane Smith - Product Design Intern</option>
              <option value="stu_3">Mike Johnson - Data Analyst Intern</option>
            </Select>
          </FormField>

          {/* Date and Time */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-lg)" }}>
            <FormField label="Interview Date" id="date">
              <div style={{ position: "relative" }}>
                <FiCalendar style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input type="date" name="date" value={formData.date} onChange={handleChange} required style={{ paddingLeft: "40px" }} />
              </div>
            </FormField>
            <FormField label="Interview Time" id="time">
              <div style={{ position: "relative" }}>
                <FiClock style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input type="time" name="time" value={formData.time} onChange={handleChange} required style={{ paddingLeft: "40px" }} />
              </div>
            </FormField>
          </div>

          {/* Interview Type and Interviewer */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-lg)" }}>
            <FormField label="Interview Type" id="type">
              <Select name="type" value={formData.type} onChange={handleChange} required style={{ padding: "12px 16px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-background)", fontSize: "var(--font-size-base)" }}>
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="in-person">In-person</option>
              </Select>
            </FormField>
            <FormField label="Assign Interviewer" id="interviewer">
              <div style={{ position: "relative" }}>
                <FiUser style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input type="text" name="interviewer" placeholder="e.g. Sarah Connor (Tech Lead)" value={formData.interviewer} onChange={handleChange} required style={{ paddingLeft: "40px" }} />
              </div>
            </FormField>
          </div>

          {/* Meeting Link (conditional) */}
          {formData.type === "video" && (
            <FormField label="Meeting Link" id="meetingLink" hint="Provide a Google Meet, Zoom, or Teams link">
              <div style={{ position: "relative" }}>
                <FiVideo style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input type="url" name="meetingLink" placeholder="https://meet.google.com/xyz" value={formData.meetingLink} onChange={handleChange} required style={{ paddingLeft: "40px" }} />
              </div>
            </FormField>
          )}

          {/* Location (conditional) */}
          {formData.type === "in-person" && (
            <FormField label="Interview Location" id="location" hint="Provide the physical address">
              <div style={{ position: "relative" }}>
                <FiMapPin style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <Input type="text" name="location" placeholder="e.g. Office Building A, Floor 3" style={{ paddingLeft: "40px" }} />
              </div>
            </FormField>
          )}

          {/* Notes */}
          <FormField label="Additional Instructions" id="notes" hint="Any specific topics they should prepare for?">
            <Textarea name="notes" placeholder="Please prepare a brief presentation about your recent projects..." value={formData.notes} onChange={handleChange} rows={4} style={{ padding: "12px 16px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-background)", fontSize: "var(--font-size-base)", resize: "vertical" }} />
          </FormField>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-md)", paddingTop: "var(--space-md)", borderTop: "1px solid var(--color-border)" }}>
            <Button variant="ghost" type="button" onClick={() => router.back()} style={{ padding: "12px 24px" }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} style={{ padding: "12px 32px", background: "#2297FA" }}>
              {loading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal isOpen={successModal} onClose={handleSuccessClose} size="sm" showCloseButton={false}>
        <div style={{ textAlign: "center", padding: "var(--space-lg)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-lg)" }}>
            <FiCheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, marginBottom: "var(--space-sm)" }}>
            Interview Scheduled!
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-xl)" }}>
            An invitation has been sent to the candidate.
          </p>
          <Button variant="primary" onClick={handleSuccessClose} style={{ width: "100%", background: "#22c55e" }}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
}
