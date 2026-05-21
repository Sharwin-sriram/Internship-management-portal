"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../../../../components/ui/Button";
import { useProtectedRoute } from "../../../../../hooks/useProtectedRoute";
import { getJson } from "../../../../../lib/api";

type CompanyApplication = {
  id: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  roleTitle: string;
  internshipId?: string;
  status: "selected" | "rejected" | string;
  appliedAt?: string;
};

type CompanyInternshipOption = { _id: string; title: string };

export default function CompanyApplicantsHistoryPage() {
  useProtectedRoute(["company"]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [postedInternships, setPostedInternships] = useState<
    CompanyInternshipOption[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInternshipId, setSelectedInternshipId] = useState(
    searchParams.get("internshipId") || "",
  );
  const [statusFilter, setStatusFilter] = useState<"" | "selected" | "rejected">(
    "",
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
      if (selectedInternshipId) params.set("internshipId", selectedInternshipId);
      if (statusFilter) params.set("status", statusFilter);

      const [appsRes, internshipsRes] = await Promise.all([
        getJson<{ success: boolean; data: CompanyApplication[] }>(
          `/companies/me/applications/history${
            params.toString() ? `?${params.toString()}` : ""
          }`,
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
        setApplications(appsRes.body.data || []);
      } else {
        setApplications([]);
        setError("Unable to load applicants history.");
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedInternshipId, statusFilter]);

  const internshipOptions = useMemo(() => {
    return postedInternships.map((internship) => ({
      id: String(internship._id),
      label: internship.title || "Untitled role",
    }));
  }, [postedInternships]);

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
            Applicants History
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Selected and rejected candidates are archived here.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/company/applicants")}
        >
          Back to active applicants
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
          display: "grid",
          gap: 14,
        }}
      >
        <div>
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

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Outcome
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter((e.target.value as "" | "selected" | "rejected") || "")
            }
            style={{
              width: "100%",
              maxWidth: 280,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #dbe4f0",
              background: "#f8fbff",
            }}
          >
            <option value="">All outcomes</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
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
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#64748b" }}>
          Loading history…
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
          No archived applicants found for this filter.
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
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
                    {application.studentEmail}
                  </p>
                </div>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background:
                      application.status === "selected"
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(239,68,68,0.12)",
                    color: application.status === "selected" ? "#10b981" : "#dc2626",
                  }}
                >
                  {application.status}
                </span>
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
                    Applied: {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

