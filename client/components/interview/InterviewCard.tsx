"use client";

import React from "react";
import Button from "../ui/Button";

export interface InterviewCardProps {
  id: string;
  companyName?: string;
  studentName?: string;
  role: string;
  date: string;
  time: string;
  type: "Phone" | "Video" | "In-person";
  interviewer?: string;
  meetingLink?: string;
  status: "Scheduled" | "Completed" | "Pending" | "Cancelled";
  onAccept?: () => void;
  onDecline?: () => void;
  onReschedule?: () => void;
  userRole: "student" | "company" | "coordinator" | "interviewer";
}

export default function InterviewCard({
  companyName,
  studentName,
  role,
  date,
  time,
  type,
  interviewer,
  meetingLink,
  status,
  onAccept,
  onDecline,
  onReschedule,
  userRole,
}: InterviewCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "Scheduled":
        return "var(--color-primary)";
      case "Completed":
        return "var(--color-success)";
      case "Cancelled":
        return "var(--color-error)";
      default:
        return "var(--color-warning, #f59e0b)";
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "var(--radius)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-lg)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "var(--font-size-lg)" }}>
            {userRole === "student" ? companyName : studentName}
          </h3>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
            {role}
          </p>
        </div>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            background: `${getStatusColor()}22`,
            color: getStatusColor(),
          }}
        >
          {status}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-sm)",
          background: "var(--color-background)",
          padding: "var(--space-md)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <div>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-muted)", display: "block" }}>
            Date & Time
          </span>
          <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>
            {date} at {time}
          </span>
        </div>
        <div>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-muted)", display: "block" }}>
            Interview Type
          </span>
          <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>
            {type === "Video" ? "📹 " : type === "Phone" ? "📞 " : "🏢 "}
            {type}
          </span>
        </div>
        {interviewer && (
          <div>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-muted)", display: "block" }}>
              Interviewer
            </span>
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>
              {interviewer}
            </span>
          </div>
        )}
        {meetingLink && (
          <div>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-muted)", display: "block" }}>
              Meeting Link
            </span>
            <a href={meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-primary)" }}>
              Join Meeting
            </a>
          </div>
        )}
      </div>

      {userRole === "student" && status === "Pending" && (
        <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
          <Button variant="primary" size="sm" onClick={onAccept} style={{ flex: 1 }}>
            Accept
          </Button>
          <Button variant="outline" size="sm" onClick={onReschedule} style={{ flex: 1 }}>
            Reschedule
          </Button>
          <Button variant="ghost" size="sm" onClick={onDecline} style={{ color: "var(--color-error)" }}>
            Decline
          </Button>
        </div>
      )}
      
      {userRole === "interviewer" && status === "Scheduled" && (
        <div style={{ marginTop: "var(--space-sm)" }}>
          <Button variant="primary" size="sm" fullWidth>
            Provide Feedback
          </Button>
        </div>
      )}
    </div>
  );
}
