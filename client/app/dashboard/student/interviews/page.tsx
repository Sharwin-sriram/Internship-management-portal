"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import InterviewCard from "../../../../components/interviews/InterviewCard";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import * as interviewApi from "../../../../services/interviewApi";
import { interviewToCardProps } from "../../../../lib/interviewMappers";
import { useProtectedRoute } from "../../../../hooks/useProtectedRoute";
import { useInterviewSocket } from "../../../../context/InterviewSocketContext";
import { useToast } from "../../../../context/ToastContext";
import { getErrorMessage } from "../../../../lib/axios";
import type { InterviewRecord } from "../../../../types/interview";

export default function StudentInterviewsPage() {
  useProtectedRoute(["student"]);
  const { subscribe } = useInterviewSocket();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"invitations" | "history">("invitations");
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<InterviewRecord[]>([]);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<(ReturnType<typeof interviewToCardProps>) | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await interviewApi.listInterviewsLegacy();
      setRaw(list);
    } catch (e) {
      showToast(getErrorMessage(e, "Could not load interviews"), "error");
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const off1 = subscribe("interview:invitation", () => load());
    const off2 = subscribe("interview:scheduled", () => load());
    return () => {
      off1();
      off2();
    };
  }, [subscribe, load]);

  const { pendingCards, upcomingCards, historyCards } = useMemo(() => {
    const pending: InterviewRecord[] = [];
    const upcoming: InterviewRecord[] = [];
    const history: InterviewRecord[] = [];

    for (const doc of raw) {
      if (["pending", "scheduled"].includes(doc.status)) pending.push(doc);
      else if (["accepted", "rescheduled"].includes(doc.status)) upcoming.push(doc);
      else if (["completed", "declined", "cancelled"].includes(doc.status)) history.push(doc);
      else if (doc.status === "reschedule_requested") pending.push(doc);
    }

    return {
      pendingCards: pending.map(interviewToCardProps),
      upcomingCards: upcoming.map(interviewToCardProps),
      historyCards: history.map(interviewToCardProps),
    };
  }, [raw]);

  const handleAccept = async (id: string) => {
    try {
      await interviewApi.acceptInterview(id);
      showToast("Interview accepted", "success");
      await load();
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await interviewApi.declineInterview(id);
      showToast("Interview declined", "info");
      await load();
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    }
  };

  const handleRescheduleRequest = (card: ReturnType<typeof interviewToCardProps>) => {
    setSelectedInterview(card);
    setRescheduleModal(true);
  };

  const submitRescheduleRequest = async () => {
    if (!selectedInterview || !rescheduleReason.trim()) return;
    try {
      await interviewApi.requestReschedule(selectedInterview.id, rescheduleReason.trim());
      setRescheduleModal(false);
      setRescheduleReason("");
      setSelectedInterview(null);
      showToast("Reschedule request sent", "success");
      await load();
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid var(--color-primary)",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>
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
          <FiCalendar size={14} /> Interview Center
        </div>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "var(--space-xs)",
          }}
        >
          My Interviews
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-base)", fontWeight: 500 }}>
          Connected to the API — accept, decline, or request a reschedule in real time.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-sm)",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        <button
          type="button"
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
            borderRadius: "var(--radius) var(--radius) 0 0",
          }}
        >
          Invitations & Upcoming
        </button>
        <button
          type="button"
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
            borderRadius: "var(--radius) var(--radius) 0 0",
          }}
        >
          History
        </button>
      </div>

      {activeTab === "invitations" && (
        <div>
          {pendingCards.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 700,
                  marginBottom: "var(--space-lg)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiClock /> Pending invitations
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                  gap: "var(--space-lg)",
                  marginBottom: "var(--space-2xl)",
                }}
              >
                {pendingCards.map((int) => {
                  const { id, ...card } = int;
                  return (
                  <InterviewCard
                    key={id}
                    {...card}
                    showActions
                    onAccept={() => handleAccept(id)}
                    onDecline={() => handleDecline(id)}
                    onReschedule={() => handleRescheduleRequest(int)}
                  />
                  );
                })}
              </div>
            </>
          )}

          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: 700,
              marginBottom: "var(--space-lg)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiCalendar /> Upcoming
          </h2>
          {upcomingCards.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--space-lg)" }}>
              {upcomingCards.map((int) => {
                const { id, ...card } = int;
                return <InterviewCard key={id} {...card} showActions={false} />;
              })}
            </div>
          ) : (
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-xl)",
                border: "1px solid var(--color-border)",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
                No upcoming interviews
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: 700,
              marginBottom: "var(--space-lg)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiCheckCircle /> History
          </h2>
          {historyCards.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--space-lg)" }}>
              {historyCards.map((int) => {
                const { id, ...card } = int;
                return <InterviewCard key={id} {...card} showActions={false} />;
              })}
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>No completed or declined interviews yet.</p>
          )}
        </div>
      )}

      <Modal isOpen={rescheduleModal} onClose={() => setRescheduleModal(false)} title="Request reschedule" size="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {selectedInterview && (
            <div
              style={{
                background: "var(--color-background)",
                padding: "var(--space-md)",
                borderRadius: "var(--radius)",
                marginBottom: "var(--space-sm)",
              }}
            >
              <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: 4 }}>{selectedInterview.jobTitle}</p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>{selectedInterview.companyName}</p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)", marginTop: 4 }}>
                {selectedInterview.date} at {selectedInterview.time}
              </p>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: 8 }}>
              Reason
            </label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Why do you need to reschedule?"
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
              <FiRefreshCw style={{ marginRight: 8 }} /> Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
