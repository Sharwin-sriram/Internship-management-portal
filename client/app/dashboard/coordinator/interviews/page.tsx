"use client";

import React, { useState } from "react";
import CalendarView from "../../../../components/interview/CalendarView";
import InterviewCard from "../../../../components/interview/InterviewCard";

export default function CoordinatorInterviewsPage() {
  const [search, setSearch] = useState("");

  const analytics = [
    { label: "Total Interviews", value: 42, color: "var(--color-primary)" },
    { label: "Pending Invitations", value: 15, color: "var(--color-warning, #f59e0b)" },
    { label: "Completed", value: 24, color: "var(--color-success)" },
    { label: "Selected Students", value: 8, color: "var(--color-primary-hover)" },
  ];

  const calendarEvents = [
    { id: "e1", title: "TechGlobal (Frontend)", date: "2026-05-14", time: "10:00 AM", type: "Video", status: "Scheduled" as const },
    { id: "e2", title: "Acme Corp (SWE)", date: "2026-05-14", time: "02:00 PM", type: "In-person", status: "Scheduled" as const },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-xl) 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-xl)" }}>
        <div>
          <h1 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-xs)" }}>Global Interviews Overview</h1>
          <p style={{ color: "var(--color-muted)" }}>Monitor all interview activities across companies and students.</p>
        </div>
        <div style={{ width: 300 }}>
          <input
            type="text"
            placeholder="Search by company or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-lg)", marginBottom: "var(--space-2xl)" }}>
        {analytics.map((stat, i) => (
          <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, background: "white", padding: "var(--space-lg)", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ display: "block", fontSize: "var(--font-size-sm)", color: "var(--color-muted)", fontWeight: 600, marginBottom: "var(--space-xs)" }}>
              {stat.label}
            </span>
            <span style={{ display: "block", fontSize: "36px", fontWeight: 800, color: stat.color }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-xl)" }}>
        {/* Calendar View */}
        <div className="animate-fade-in">
          <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-md)" }}>Master Calendar</h2>
          <CalendarView events={calendarEvents} />
        </div>

        {/* Recent Activity Sidebar */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-md)" }}>Recent Updates</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <InterviewCard
              id="c1"
              companyName="TechGlobal"
              studentName="John Doe"
              role="Frontend Developer"
              date="2026-05-14"
              time="10:00 AM"
              type="Video"
              status="Scheduled"
              userRole="coordinator"
            />
            <InterviewCard
              id="c2"
              companyName="Acme Corp"
              studentName="Jane Smith"
              role="Software Engineer Intern"
              date="2026-05-12"
              time="04:00 PM"
              type="In-person"
              status="Completed"
              userRole="coordinator"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
