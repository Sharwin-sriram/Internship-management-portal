"use client";

import React, { useState, useEffect } from "react";
import InterviewCard from "../../../../components/interview/InterviewCard";
import Timeline from "../../../../components/interview/Timeline";
import { getJson, patchJson } from "../../../../lib/api";

export default function StudentInterviewsPage() {
  const [activeTab, setActiveTab] = useState<"invitations" | "history">("invitations");
  const [loading, setLoading] = useState(true);
  
  // These would be populated by the API in a full implementation
  const [pendingInterviews, setPendingInterviews] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      const res = await getJson<any[]>("/interviews");
      if (res.ok && res.body) {
        // Mock filtering logic for demonstration
        setPendingInterviews(res.body.filter(i => i.status === "scheduled"));
      } else {
        // Fallback mock data if API is empty/fails
        setPendingInterviews([
          {
            id: "mock_1",
            companyName: "Acme Corp",
            role: "Software Engineer Intern",
            date: "2026-05-22",
            time: "10:00 AM",
            type: "Video",
            interviewer: "Sarah Connor",
            status: "Pending",
          }
        ]);
        setUpcomingInterviews([
          {
            id: "int_2",
            companyName: "TechGlobal",
            role: "Frontend Developer",
            date: "2026-05-24",
            time: "02:00 PM",
            type: "In-person",
            interviewer: "John Smith",
            status: "Scheduled",
          }
        ]);
      }
      setLoading(false);
    };
    
    fetchInterviews();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    await patchJson(`/interviews/${id}/status`, { status });
    alert(`Status updated to ${status}`);
  };



  // Mock data for timeline
  const timelineEvents = [
    { id: 1, title: "Application Submitted", date: "May 1", status: "completed" as const },
    { id: 2, title: "Resume Screening", date: "May 10", status: "completed" as const },
    { id: 3, title: "Round 1: Technical Interview", date: "May 24", status: "current" as const, description: "In-person interview at TechGlobal office." },
    { id: 4, title: "HR Round", status: "upcoming" as const },
    { id: 5, title: "Final Decision", status: "upcoming" as const },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "var(--space-xl) 0" }}>
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-xs)" }}>My Interviews</h1>
        <p style={{ color: "var(--color-muted)" }}>Manage your interview invitations and track your progress.</p>
      </div>

      <div style={{ display: "flex", gap: "var(--space-md)", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-xl)" }}>
        <button
          onClick={() => setActiveTab("invitations")}
          style={{
            padding: "var(--space-sm) var(--space-lg)",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "invitations" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "invitations" ? "var(--color-primary)" : "var(--color-muted)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "var(--font-size-md)",
            transition: "all var(--transition-fast)",
          }}
        >
          Invitations & Upcoming
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "var(--space-sm) var(--space-lg)",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "history" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "history" ? "var(--color-primary)" : "var(--color-muted)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "var(--font-size-md)",
            transition: "all var(--transition-fast)",
          }}
        >
          Progress & History
        </button>
      </div>

      {activeTab === "invitations" && (
        <div className="animate-fade-in-up">
          <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-lg)" }}>Pending Invitations</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "var(--space-lg)", marginBottom: "var(--space-2xl)" }}>
            {pendingInterviews.map((int) => (
              <InterviewCard
                key={int.id}
                {...int}
                userRole="student"
                onAccept={() => handleStatusUpdate(int.id, "scheduled")}
                onDecline={() => handleStatusUpdate(int.id, "cancelled")}
                onReschedule={() => handleStatusUpdate(int.id, "rescheduled")}
              />
            ))}
            {pendingInterviews.length === 0 && (
              <p style={{ color: "var(--color-muted)" }}>No pending invitations right now.</p>
            )}
          </div>

          <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-lg)" }}>Upcoming Interviews</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "var(--space-lg)" }}>
            {upcomingInterviews.map((int) => (
              <InterviewCard
                key={int.id}
                {...int}
                userRole="student"
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="animate-fade-in-up" style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "var(--space-2xl)" }}>
          <div>
            <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-lg)" }}>Active Applications Progress</h2>
            <div style={{ background: "white", padding: "var(--space-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ marginBottom: "var(--space-md)", fontSize: "var(--font-size-md)", color: "var(--color-primary)" }}>TechGlobal - Frontend Developer</h3>
              <Timeline events={timelineEvents} />
            </div>
          </div>
          
          <div>
            <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-lg)" }}>Past Interviews</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <InterviewCard
                id="int_past1"
                companyName="InnovaTech"
                role="UI/UX Intern"
                date="2026-04-15"
                time="11:00 AM"
                type="Video"
                status="Completed"
                userRole="student"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
