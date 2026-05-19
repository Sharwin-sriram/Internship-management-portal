"use client";

import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiX, FiRefreshCw } from "react-icons/fi";
import InterviewCard from "../../../../components/interviews/InterviewCard";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import { getJson, patchJson } from "../../../../lib/api";

export default function StudentInterviewsPage() {
  const [activeTab, setActiveTab] = useState<"invitations" | "history">("invitations");
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  
  const [pendingInterviews, setPendingInterviews] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      const res = await getJson<any[]>("/interviews");
      if (res.ok && res.body) {
        setPendingInterviews(res.body.filter((i: any) => i.status === "pending"));
        setUpcomingInterviews(res.body.filter((i: any) => i.status === "accepted" || i.status === "scheduled"));
      } else {
        setPendingInterviews([
          {
            id: "mock_1",
            companyName: "Acme Corp",
            jobTitle: "Software Engineer Intern",
            date: "2026-05-22",
            time: "10:00 AM",
            interviewType: "video" as const,
            interviewerName: "Sarah Connor",
            meetingLink: "https://meet.google.com/abc-defg-hij",
            status: "pending" as const,
          }
        ]);
        setUpcomingInterviews([
          {
            id: "int_2",
            companyName: "TechGlobal",
            jobTitle: "Frontend Developer",
            date: "2026-05-24",
            time: "02:00 PM",
            interviewType: "in-person" as const,
            interviewerName: "John Smith",
            location: "123 Tech Street, Building A",
            status: "accepted" as const,
          }
        ]);
      }
      setLoading(false);
    };
    
    fetchInterviews();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    await patchJson(`/interviews/${id}/status`, { status });
    if (status === "accepted") {
      setPendingInterviews(pendingInterviews.filter(i => i.id !== id));
      setUpcomingInterviews([...upcomingInterviews, pendingInterviews.find(i => i.id === id)!]);
    } else if (status === "declined") {
      setPendingInterviews(pendingInterviews.filter(i => i.id !== id));
    }
  };

  const handleRescheduleRequest = (interview: any) => {
    setSelectedInterview(interview);
    setRescheduleModal(true);
  };

  const submitRescheduleRequest = async () => {
    if (!rescheduleReason.trim()) return;
    await patchJson(`/interviews/${selectedInterview.id}/reschedule`, { reason: rescheduleReason });
    setRescheduleModal(false);
    setRescheduleReason("");
    setSelectedInterview(null);
    alert("Reschedule request sent successfully!");
  };

  const pastInterviews = [
    {
      id: "int_past1",
      companyName: "InnovaTech",
      jobTitle: "UI/UX Intern",
      date: "2026-04-15",
      time: "11:00 AM",
      interviewType: "video" as const,
      interviewerName: "Emily Chen",
      status: "completed" as const,
    },
    {
      id: "int_past2",
      companyName: "DataCorp",
      jobTitle: "Data Analyst Intern",
      date: "2026-04-10",
      time: "03:00 PM",
      interviewType: "phone" as const,
      interviewerName: "Michael Brown",
      status: "completed" as const,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(34,151,250,0.1)", color: "#2297FA", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-sm)" }}>
          <FiCalendar size={14} /> Interview Center
        </div>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "var(--space-xs)" }}>
          My Interviews
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-base)", fontWeight: 500 }}>
          Manage your interview invitations and track your progress
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "var(--space-sm)", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-2xl)" }}>
        <button
          onClick={() => setActiveTab("invitations")}
          style={{
            padding: "12px 24px",
            background: activeTab === "invitations" ? "rgba(34,151,250,0.1)" : "transparent",
            border: "none",
            borderBottom: activeTab === "invitations" ? "2px solid #2297FA" : "2px solid transparent",
            color: activeTab === "invitations" ? "#2297FA" : "var(--color-muted)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "all var(--transition-fast)",
            borderRadius: "var(--radius) var(--radius) 0 0",
          }}
        >
          Invitations & Upcoming
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "12px 24px",
            background: activeTab === "history" ? "rgba(34,151,250,0.1)" : "transparent",
            border: "none",
            borderBottom: activeTab === "history" ? "2px solid #2297FA" : "2px solid transparent",
            color: activeTab === "history" ? "#2297FA" : "var(--color-muted)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "all var(--transition-fast)",
            borderRadius: "var(--radius) var(--radius) 0 0",
          }}
        >
          History
        </button>
      </div>

      {activeTab === "invitations" && (
        <div>
          {/* Pending Invitations */}
          {pendingInterviews.length > 0 && (
            <>
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-lg)", display: "flex", alignItems: "center", gap: 8 }}>
                <FiClock /> Pending Invitations
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--space-lg)", marginBottom: "var(--space-2xl)" }}>
                {pendingInterviews.map((int) => (
                  <InterviewCard
                    key={int.id}
                    {...int}
                    showActions={true}
                    onAccept={() => handleStatusUpdate(int.id, "accepted")}
                    onDecline={() => handleStatusUpdate(int.id, "declined")}
                    onReschedule={() => handleRescheduleRequest(int)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Upcoming Interviews */}
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-lg)", display: "flex", alignItems: "center", gap: 8 }}>
            <FiCalendar /> Upcoming Interviews
          </h2>
          {upcomingInterviews.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--space-lg)" }}>
              {upcomingInterviews.map((int) => (
                <InterviewCard
                  key={int.id}
                  {...int}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-xl)", border: "1px solid var(--color-border)", textAlign: "center" }}>
              <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>No upcoming interviews scheduled</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-lg)", display: "flex", alignItems: "center", gap: 8 }}>
            <FiCheckCircle /> Interview History
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--space-lg)" }}>
            {pastInterviews.map((int) => (
              <InterviewCard
                key={int.id}
                {...int}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Request Modal */}
      <Modal isOpen={rescheduleModal} onClose={() => setRescheduleModal(false)} title="Request Reschedule" size="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {selectedInterview && (
            <div style={{ background: "var(--color-background)", padding: "var(--space-md)", borderRadius: "var(--radius)", marginBottom: "var(--space-sm)" }}>
              <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: 4 }}>{selectedInterview.jobTitle}</p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>{selectedInterview.companyName}</p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)", marginTop: 4 }}>
                {selectedInterview.date} at {selectedInterview.time}
              </p>
            </div>
          )}
          
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: 8 }}>
              Reason for Reschedule
            </label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Please explain why you need to reschedule..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-base)",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
            <Button variant="ghost" onClick={() => setRescheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitRescheduleRequest} style={{ background: "#2297FA" }}>
              <FiRefreshCw style={{ marginRight: 8 }} /> Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
