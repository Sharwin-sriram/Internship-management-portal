"use client";

import React, { useState } from "react";
import Button from "../ui/Button";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: "Scheduled" | "Completed" | "Pending" | "Cancelled";
}

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [view, setView] = useState<"month" | "week">("week");
  
  // Dummy logic for getting days of the week (assumes current week for mock)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = [12, 13, 14, 15, 16, 17, 18]; // Mock dates

  return (
    <div style={{ background: "white", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
      {/* Calendar Header */}
      <div style={{ padding: "var(--space-md) var(--space-lg)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>May 2026</h3>
        <div style={{ display: "flex", gap: "var(--space-sm)", background: "var(--color-background)", padding: 4, borderRadius: "var(--radius-sm)" }}>
          <button
            onClick={() => setView("week")}
            style={{
              padding: "4px 12px",
              background: view === "week" ? "white" : "transparent",
              border: "none",
              borderRadius: "4px",
              boxShadow: view === "week" ? "var(--shadow-sm)" : "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "var(--font-size-sm)",
            }}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            style={{
              padding: "4px 12px",
              background: view === "month" ? "white" : "transparent",
              border: "none",
              borderRadius: "4px",
              boxShadow: view === "month" ? "var(--shadow-sm)" : "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "var(--font-size-sm)",
            }}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Grid (Week View Mock) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minHeight: 400 }}>
        {days.map((day, i) => (
          <div key={day} style={{ borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
            {/* Day Header */}
            <div style={{ padding: "var(--space-sm)", textAlign: "center", borderBottom: "1px solid var(--color-border)", background: "var(--color-background)" }}>
              <span style={{ display: "block", fontSize: "var(--font-size-xs)", color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase" }}>{day}</span>
              <span style={{ display: "block", fontSize: "var(--font-size-lg)", fontWeight: 700, color: dates[i] === 14 ? "var(--color-primary)" : "inherit" }}>
                {dates[i]}
              </span>
            </div>
            {/* Day Content */}
            <div style={{ flex: 1, padding: "var(--space-xs)" }}>
              {events
                .filter((e) => parseInt(e.date.split("-")[2]) === dates[i])
                .map((event) => (
                  <div
                    key={event.id}
                    className="animate-fade-in"
                    style={{
                      background: "var(--color-primary-10)",
                      borderLeft: "3px solid var(--color-primary)",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      cursor: "pointer",
                      transition: "transform var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <span style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--color-primary)" }}>{event.time}</span>
                    <span style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.title}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
