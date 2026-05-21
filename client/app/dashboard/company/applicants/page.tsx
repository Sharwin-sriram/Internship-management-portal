"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../../../components/ui/Button";
import { useProtectedRoute } from "../../../../hooks/useProtectedRoute";
import { useToast } from "../../../../context/ToastContext";
import { getJson, patchJson } from "../../../../lib/api";
import Modal from "../../../../components/ui/Modal";


type CompanyApplication = {
  id: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  roleTitle: string;
  internshipId?: string;
  status: string;
  appliedAt?: string;
};

type CompanyInternshipOption = { _id: string; title: string };

function CompanyApplicantsContent() {
  useProtectedRoute(["company"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [postedInternships, setPostedInternships] = useState<
    CompanyInternshipOption[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [selectedInternshipId, setSelectedInternshipId] = useState(
    searchParams.get("internshipId") || "",
  );

  useEffect(() => {
    const internshipId = searchParams.get("internshipId") || "";
    setSelectedInternshipId(internshipId);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (selectedInternshipId) {
        params.set("internshipId", selectedInternshipId);
      }

      const [appsRes, internshipsRes] = await Promise.all([
        getJson<{
          success: boolean;
          data: CompanyApplication[];
        }>(
          `/companies/me/applications${params.toString() ? `?${params.toString()}` : ""}`,
        ),
        getJson<{ success: boolean; data: CompanyInternshipOption[] }>(
          "/internships/me",
        ),
      ]);

      if (cancelled) return;

      if (internshipsRes.ok && internshipsRes.body?.success) {
        setPostedInternships(internshipsRes.body.data || []);
      } else {
        setPostedInternships([]);
      }

      if (appsRes.ok && appsRes.body?.success) {
        setApplications(appsRes.body.data);
      } else {
        setApplications([]);
        setError("Unable to load company applications.");
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedInternshipId]);

  const internshipOptions = useMemo(() => {
    const seen = new Map<string, string>();
    postedInternships.forEach((internship) => {
      seen.set(String(internship._id), internship.title || "Untitled role");
    });
    applications.forEach((application) => {
      if (application.internshipId) {
        seen.set(application.internshipId, application.roleTitle);
      }
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [applications, postedInternships]);

  async function handleShortlist(applicationId: string) {
    setUpdatingId(applicationId);
    setError("");

    const res = await patchJson<{
      success: boolean;
      data: { id: string; status: string };
    }>(`/companies/me/applications/${applicationId}/shortlist`, {});

    if (res.ok && res.body?.success) {
      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? { ...application, status: "shortlisted" }
            : application,
        ),
      );
      showToast("Candidate shortlisted", "success");
    } else {
      const message = (res.body as { message?: string } | null)?.message;
      setError(message || "Unable to shortlist candidate.");
      showToast(message || "Unable to shortlist candidate.", "error");
    }

    setUpdatingId(null);
  }

  async function handleReject(applicationId: string) {
    if (!applicationId) return;
    setUpdatingId(applicationId);
    setError("");

    const res = await patchJson<{
      success: boolean;
      data: { id: string; status: string; rejection_reason?: string };
    }>(`/companies/me/applications/${applicationId}/reject`, {
      rejection_reason: rejectionReason,
    });

    if (res.ok && res.body?.success) {
      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? { ...application, status: "rejected" }
            : application,
        ),
      );
      showToast("Candidate rejected", "success");
      setRejectingId(null);
      setRejectionReason("");
    } else {
      const message = (res.body as { message?: string } | null)?.message;
      setError(message || "Unable to reject candidate.");
      showToast(message || "Unable to reject candidate.", "error");
    }

    setUpdatingId(null);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Applicants
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Review applications and shortlist candidates for interviews.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/company/interviews/schedule")}
        >
          Go to interview scheduler
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/company/applicants/history")}
        >
          View applicants history
        </Button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 18,
          border: "1px solid rgba(148,174,254,0.25)",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          marginBottom: 20,
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 8,
          }}
        >
          Filter by internship
        </label>
        <select
          value={selectedInternshipId}
          onChange={(e) => setSelectedInternshipId(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #dbe4f0",
            background: "#f8fbff",
          }}
        >
          <option value="">All internships</option>
          {internshipOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(239,68,68,0.08)",
            color: "#b91c1c",
            border: "1px solid rgba(239,68,68,0.18)",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{ padding: "3rem 0", textAlign: "center", color: "#64748b" }}
        >
          Loading applications…
        </div>
      ) : applications.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            borderRadius: 18,
            border: "1px dashed #cbd5e1",
            background: "#fff",
            color: "#64748b",
          }}
        >
          No applications found for this filter.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {applications.map((application) => (
            <div
              key={application.id}
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
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {application.studentName}
                  </h3>
                  <p style={{ margin: "0 0 4px", color: "#475569" }}>
                    {application.roleTitle}
                  </p>
                  <p
                    style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}
                  >
                    {application.studentEmail}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background:
                        application.status === "shortlisted"
                          ? "rgba(16,185,129,0.12)"
                          : application.status === "rejected"
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(59,130,246,0.12)",
                      color:
                        application.status === "shortlisted"
                          ? "#10b981"
                          : application.status === "rejected"
                            ? "#ef4444"
                            : "#2563eb",
                    }}
                  >
                    {application.status}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        application.studentId &&
                        router.push(`/profile/${application.studentId}`)
                      }
                    >
                      View profile
                    </Button>
                    {application.status !== "rejected" && (
                      <>
                        {application.status !== "shortlisted" && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={updatingId === application.id}
                            onClick={() => handleShortlist(application.id)}
                          >
                            Shortlist
                          </Button>
                        )}
                        {application.status === "shortlisted" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              router.push("/dashboard/company/interviews/schedule")
                            }
                          >
                            Schedule interview
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setRejectingId(application.id);
                            setRejectionReason("");
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  color: "#64748b",
                  fontSize: "0.85rem",
                }}
              >
                <span>Application ID: {application.id}</span>
                {application.appliedAt && (
                  <span>
                    Applied:{" "}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Link
          href="/dashboard/company/interviews/schedule"
          style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
        >
          Continue to interview scheduling →
        </Link>
      </div>
      <Modal
        isOpen={rejectingId !== null}
        onClose={() => {
          setRejectingId(null);
          setRejectionReason("");
        }}
        title="Reject Candidate"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, color: "#475569" }}>
            Are you sure you want to reject this candidate? Please provide a reason for the rejection (optional but recommended to help the candidate improve).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="rejection-reason"
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              Rejection Reason
            </label>
            <textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Low match on requested React/Node skills"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1.5px solid #cbd5e1",
                fontSize: "1rem",
                color: "#0f172a",
                background: "#fff",
                outline: "none",
                resize: "vertical",
                minHeight: "80px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectingId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={updatingId === rejectingId}
              onClick={() => rejectingId && handleReject(rejectingId)}
            >
              Reject Candidate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function CompanyApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "3rem 0",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading applications…
        </div>
      }
    >
      <CompanyApplicantsContent />
    </Suspense>
  );
}
