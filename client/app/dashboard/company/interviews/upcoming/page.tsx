"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiXCircle,
} from "react-icons/fi";
import Modal from "../../../../../components/ui/Modal";
import {
  FormField,
  Input,
  Select,
  Textarea,
} from "../../../../../components/ui/FormField";
import Button from "../../../../../components/ui/Button";
import { useProtectedRoute } from "../../../../../hooks/useProtectedRoute";
import { useToast } from "../../../../../context/ToastContext";
import { getJson } from "../../../../../lib/api";
import * as interviewApi from "../../../../../services/interviewApi";
import type { InterviewRecord } from "../../../../../types/interview";

type Decision = "selected" | "rejected";

type RecruiterOption = {
  _id: string;
  name: string;
  email?: string;
  title?: string;
};

function toLocalDatetimeValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}

function getInterviewerId(value: InterviewRecord["interviewer_id"]) {
  if (!value || typeof value === "string") return "";
  return value._id || "";
}

function isUpcomingInterview(i: InterviewRecord, now: number) {
  const t = new Date(i.scheduled_at).getTime();
  if (Number.isNaN(t)) return false;
  // show interviews that are scheduled in the future (or within last 2 hours)
  return t >= now - 2 * 60 * 60 * 1000;
}

function isActiveStatus(status: string) {
  return (
    status === "pending" ||
    status === "scheduled" ||
    status === "accepted" ||
    status === "reschedule_requested" ||
    status === "rescheduled"
  );
}

export default function UpcomingCompanyInterviewsPage() {
  useProtectedRoute(["company"]);
  const { showToast } = useToast();

  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterOption[]>([]);
  const [recruitersLoading, setRecruitersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [rescheduleOpenId, setRescheduleOpenId] = useState<string | null>(null);
  const [rescheduleAtById, setRescheduleAtById] = useState<
    Record<string, string>
  >({});
  const [meetingLinkById, setMeetingLinkById] = useState<
    Record<string, string>
  >({});
  const [editOpenId, setEditOpenId] = useState<string | null>(null);
  const [editAtById, setEditAtById] = useState<Record<string, string>>({});
  const [editMeetingLinkById, setEditMeetingLinkById] = useState<
    Record<string, string>
  >({});
  const [editInterviewerById, setEditInterviewerById] = useState<
    Record<string, string>
  >({});

  const loadRecruiters = useCallback(async () => {
    setRecruitersLoading(true);
    try {
      const res = await getJson<{ success: boolean; data: RecruiterOption[] }>(
        "/companies/me/recruiters",
      );
      if (res.ok && res.body?.success) {
        setRecruiters(res.body.data || []);
      } else {
        setRecruiters([]);
      }
    } catch {
      setRecruiters([]);
    } finally {
      setRecruitersLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await interviewApi.listInterviews();
      setRecords(list);
    } catch {
      setRecords([]);
      showToast("Could not load interviews", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadRecruiters();
  }, [loadRecruiters]);

  const openEditor = (record: InterviewRecord) => {
    setEditOpenId(record._id);
    setEditAtById((prev) => ({
      ...prev,
      [record._id]:
        prev[record._id] ?? toLocalDatetimeValue(record.scheduled_at),
    }));
    setEditMeetingLinkById((prev) => ({
      ...prev,
      [record._id]: prev[record._id] ?? (record.meeting_link || ""),
    }));
    setEditInterviewerById((prev) => ({
      ...prev,
      [record._id]: prev[record._id] ?? getInterviewerId(record.interviewer_id),
    }));
    if (notesById[record._id] === undefined) {
      setNotesById((prev) => ({
        ...prev,
        [record._id]: record.instructions || "",
      }));
    }
  };

  const upcoming = useMemo(() => {
    const now = Date.now();
    return records
      .filter((i) => isActiveStatus(i.status) && isUpcomingInterview(i, now))
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime(),
      );
  }, [records]);

  const markComplete = async (id: string, decision: Decision) => {
    setBusyId(id);
    try {
      await interviewApi.completeInterview(id, decision, notesById[id]);
      showToast(
        decision === "selected"
          ? "Marked completed — candidate selected"
          : "Marked completed — candidate rejected",
        "success",
      );
      await load();
    } catch (e) {
      showToast("Could not update interview outcome", "error");
    } finally {
      setBusyId(null);
    }
  };

  const reschedule = async (id: string) => {
    const scheduledAt = rescheduleAtById[id];
    if (!scheduledAt) {
      showToast("Choose a new date & time", "error");
      return;
    }

    setBusyId(id);
    try {
      const iso = new Date(scheduledAt).toISOString();
      await interviewApi.rescheduleInterviewCompany(id, {
        scheduled_at: iso,
        meeting_link: meetingLinkById[id] ?? "",
        instructions: notesById[id] ?? "",
      });
      showToast("Interview rescheduled", "success");
      setRescheduleOpenId(null);
      await load();
    } catch (e) {
      showToast("Could not reschedule interview", "error");
    } finally {
      setBusyId(null);
    }
  };

  const saveEdits = async (id: string) => {
    const scheduledAt = editAtById[id];
    if (!scheduledAt) {
      showToast("Choose a new date & time", "error");
      return;
    }

    setBusyId(id);
    try {
      await interviewApi.rescheduleInterviewCompany(id, {
        scheduled_at: new Date(scheduledAt).toISOString(),
        meeting_link: editMeetingLinkById[id] ?? "",
        instructions: notesById[id] ?? "",
        ...(editInterviewerById[id]
          ? { interviewer_id: editInterviewerById[id] }
          : {}),
      });
      showToast("Interview updated", "success");
      setEditOpenId(null);
      await load();
    } catch {
      showToast("Could not update interview", "error");
    } finally {
      setBusyId(null);
    }
  };

  const selectedInterview = editOpenId
    ? records.find((record) => record._id === editOpenId) || null
    : null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(34,151,250,0.1)",
            color: "#2297FA",
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <FiCalendar /> Upcoming
        </div>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
            fontWeight: 900,
            margin: "10px 0 6px",
          }}
        >
          Upcoming Interviews
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>
          Mark interviews as complete and decide whether the candidate is
          selected or rejected.
        </p>
      </div>

      {loading ? (
        <div
          style={{ padding: "3rem 0", textAlign: "center", color: "#64748b" }}
        >
          Loading interviews…
        </div>
      ) : upcoming.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            borderRadius: 18,
            border: "1px dashed #cbd5e1",
            background: "#fff",
            color: "#64748b",
          }}
        >
          No upcoming interviews.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {upcoming.map((i) => {
            const scheduledAt = new Date(i.scheduled_at);
            const app =
              i.application && typeof i.application === "object"
                ? i.application
                : null;
            const studentName = app?.student?.user?.name || "Candidate";
            const studentEmail = app?.student?.user?.email || "";
            const roleTitle = app?.internship?.title || "Internship";

            return (
              <div
                key={i._id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: 18,
                  border: "1px solid rgba(148,174,254,0.2)",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: "0 0 6px",
                        fontSize: "1.05rem",
                        fontWeight: 900,
                        color: "#0f172a",
                      }}
                    >
                      {studentName}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 4px",
                        color: "#475569",
                        fontWeight: 700,
                      }}
                    >
                      {roleTitle}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                      }}
                    >
                      {studentEmail}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: "rgba(15,23,42,0.04)",
                        border: "1px solid rgba(15,23,42,0.06)",
                        color: "#0f172a",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                      }}
                    >
                      <FiClock />
                      {Number.isNaN(scheduledAt.getTime())
                        ? "—"
                        : scheduledAt.toLocaleString()}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      Type: {i.interview_type}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: 6,
                      }}
                    >
                      Notes (optional)
                    </label>
                    <textarea
                      value={notesById[i._id] ?? ""}
                      onChange={(e) =>
                        setNotesById((prev) => ({
                          ...prev,
                          [i._id]: e.target.value,
                        }))
                      }
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid #dbe4f0",
                        background: "#f8fbff",
                        resize: "vertical",
                      }}
                      placeholder="Internal notes about this interview / decision…"
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRescheduleOpenId((prev) =>
                          prev === i._id ? null : i._id,
                        );
                        if (!rescheduleAtById[i._id]) {
                          const d = new Date(i.scheduled_at);
                          const local = new Date(
                            d.getTime() - d.getTimezoneOffset() * 60 * 1000,
                          )
                            .toISOString()
                            .slice(0, 16);
                          setRescheduleAtById((p) => ({
                            ...p,
                            [i._id]: local,
                          }));
                        }
                        if (meetingLinkById[i._id] === undefined) {
                          setMeetingLinkById((p) => ({
                            ...p,
                            [i._id]: i.meeting_link || "",
                          }));
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <FiEdit3 /> Reschedule
                    </Button>
                  </div>

                  {rescheduleOpenId === i._id && (
                    <div
                      style={{
                        borderRadius: 16,
                        border: "1px solid rgba(148,174,254,0.25)",
                        background: "rgba(34,151,250,0.03)",
                        padding: 14,
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "grid", gap: 6 }}>
                        <label style={{ fontWeight: 800, fontSize: "0.8rem" }}>
                          New date & time
                        </label>
                        <input
                          type="datetime-local"
                          value={rescheduleAtById[i._id] ?? ""}
                          onChange={(e) =>
                            setRescheduleAtById((p) => ({
                              ...p,
                              [i._id]: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            maxWidth: 320,
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid #dbe4f0",
                            background: "#fff",
                          }}
                        />
                      </div>
                      <div style={{ display: "grid", gap: 6 }}>
                        <label style={{ fontWeight: 800, fontSize: "0.8rem" }}>
                          Meeting link (optional)
                        </label>
                        <input
                          value={meetingLinkById[i._id] ?? ""}
                          onChange={(e) =>
                            setMeetingLinkById((p) => ({
                              ...p,
                              [i._id]: e.target.value,
                            }))
                          }
                          placeholder="https://meet.google.com/…"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid #dbe4f0",
                            background: "#fff",
                          }}
                        />
                      </div>
                      <div
                        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          loading={busyId === i._id}
                          onClick={() => reschedule(i._id)}
                        >
                          Save reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRescheduleOpenId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button
                      variant="primary"
                      loading={busyId === i._id}
                      onClick={(event) => {
                        event.stopPropagation();
                        markComplete(i._id, "selected");
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <FiCheckCircle /> Complete + Select
                    </Button>
                    <Button
                      variant="danger"
                      loading={busyId === i._id}
                      onClick={(event) => {
                        event.stopPropagation();
                        markComplete(i._id, "rejected");
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <FiXCircle /> Complete + Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedInterview)}
        onClose={() => setEditOpenId(null)}
        title="Interview options"
        size="lg"
      >
        {selectedInterview && (
          <div style={{ display: "grid", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>
                  {selectedInterview.application &&
                  typeof selectedInterview.application === "object"
                    ? selectedInterview.application.student?.user?.name ||
                      "Candidate"
                    : "Candidate"}
                </h3>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                  {selectedInterview.application &&
                  typeof selectedInterview.application === "object"
                    ? selectedInterview.application.internship?.title ||
                      "Interview"
                    : "Interview"}
                </p>
              </div>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(34,151,250,0.1)",
                  color: "#2297FA",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {selectedInterview.status}
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                <FormField label="Date & time" id="edit-scheduled-at">
                  <Input
                    type="datetime-local"
                    value={editAtById[selectedInterview._id] ?? ""}
                    onChange={(event) =>
                      setEditAtById((prev) => ({
                        ...prev,
                        [selectedInterview._id]: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField label="Interviewer" id="edit-interviewer">
                  <Select
                    value={editInterviewerById[selectedInterview._id] ?? ""}
                    onChange={(event) =>
                      setEditInterviewerById((prev) => ({
                        ...prev,
                        [selectedInterview._id]: event.target.value,
                      }))
                    }
                    disabled={recruitersLoading}
                  >
                    <option value="">Keep current interviewer</option>
                    {recruiters.map((recruiter) => (
                      <option key={recruiter._id} value={recruiter._id}>
                        {recruiter.name}
                        {recruiter.email ? ` · ${recruiter.email}` : ""}
                        {recruiter.title ? ` · ${recruiter.title}` : ""}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField label="Meeting link" id="edit-meeting-link">
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={editMeetingLinkById[selectedInterview._id] ?? ""}
                  onChange={(event) =>
                    setEditMeetingLinkById((prev) => ({
                      ...prev,
                      [selectedInterview._id]: event.target.value,
                    }))
                  }
                />
              </FormField>

              <FormField label="Instructions" id="edit-notes">
                <Textarea
                  rows={4}
                  placeholder="Internal instructions, talking points, or notes"
                  value={notesById[selectedInterview._id] ?? ""}
                  onChange={(event) =>
                    setNotesById((prev) => ({
                      ...prev,
                      [selectedInterview._id]: event.target.value,
                    }))
                  }
                />
              </FormField>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                paddingTop: 12,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button variant="ghost" onClick={() => setEditOpenId(null)}>
                  Close
                </Button>
                <Button
                  variant="secondary"
                  loading={busyId === selectedInterview._id}
                  onClick={() => saveEdits(selectedInterview._id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiEdit3 /> Save changes
                </Button>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  variant="primary"
                  loading={busyId === selectedInterview._id}
                  onClick={() =>
                    markComplete(selectedInterview._id, "selected")
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiCheckCircle /> Complete + Select
                </Button>
                <Button
                  variant="danger"
                  loading={busyId === selectedInterview._id}
                  onClick={() =>
                    markComplete(selectedInterview._id, "rejected")
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiXCircle /> Complete + Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
