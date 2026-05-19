"use client";

import React from "react";

export interface TimelineEvent {
  id: string | number;
  title: string;
  date?: string;
  status: "completed" | "current" | "upcoming" | "rejected";
  description?: string;
}

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div style={{ padding: "var(--space-md) 0" }}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const color =
          event.status === "completed"
            ? "var(--color-success)"
            : event.status === "current"
            ? "var(--color-primary)"
            : event.status === "rejected"
            ? "var(--color-error)"
            : "var(--color-muted)";
            
        return (
          <div key={event.id} style={{ display: "flex", gap: "var(--space-md)" }}>
            {/* Timeline Line & Dot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: event.status === "upcoming" ? "transparent" : color,
                  border: `2px solid ${color}`,
                  boxShadow: event.status === "current" ? `0 0 0 4px ${color}33` : "none",
                  zIndex: 1,
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: event.status === "completed" ? "var(--color-success)" : "var(--color-border)",
                    minHeight: 40,
                    margin: "4px 0",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : "var(--space-lg)", flex: 1, paddingTop: -2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "var(--font-size-md)", color: event.status === "upcoming" ? "var(--color-muted)" : "var(--color-foreground)" }}>
                  {event.title}
                </h4>
                {event.date && (
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
                    {event.date}
                  </span>
                )}
              </div>
              {event.description && (
                <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
                  {event.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
