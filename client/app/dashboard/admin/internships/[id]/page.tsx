"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchAdminInternshipDetail,
  type AdminInternshipDetail,
} from "../../../../../services/adminApi";

function formatStipend(min: number, max: number) {
  const f = (n: number) =>
    `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  return min === max ? `${f(min)}/mo` : `${f(min)} – ${f(max)}/mo`;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-md)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-muted)", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    applied: "Applied",
    pending: "Pending",
    reviewed: "Reviewed",
    shortlisted: "Shortlisted",
    interview_scheduled: "Interview",
    interviewing: "Interview",
    selected: "Selected",
    rejected: "Rejected",
    offer_issued: "Offer issued",
  };
  return map[status] ?? status;
}

export default function AdminInternshipDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  const [detail, setDetail] = useState<AdminInternshipDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchAdminInternshipDetail(id);
      setDetail(res.data ?? null);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted)" }}>
        Loading internship…
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <Link href="/dashboard/admin/internships" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          ← Back to internships
        </Link>
        <p style={{ marginTop: 16, color: "var(--color-muted)" }}>Internship not found.</p>
      </div>
    );
  }

  const { internship, company, stats, applications, eligibility } = detail;
  const companyId =
    typeof company === "object" && company !== null && "_id" in company
      ? String(company._id)
      : null;

  return (
    <div>
      <Link
        href="/dashboard/admin/internships"
        style={{
          display: "inline-block",
          marginBottom: "var(--space-lg)",
          color: "var(--color-primary)",
          fontWeight: 600,
          textDecoration: "none",
          fontSize: "var(--font-size-sm)",
        }}
      >
        ← Back to internships
      </Link>

      <header
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <p
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            color: "#50B6FE",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          {internship.status}
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>
          {internship.title}
        </h1>
        {companyId && (
          <p style={{ color: "var(--color-muted)", marginBottom: "var(--space-md)" }}>
            Posted by{" "}
            <Link
              href={`/dashboard/admin/companies/${companyId}`}
              style={{ color: "var(--color-primary)", fontWeight: 700 }}
            >
              {(company as { company_name?: string }).company_name || "Company"}
            </Link>
          </p>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-md)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-muted)",
          }}
        >
          <span>{formatStipend(internship.stipend_min, internship.stipend_max)}</span>
          <span>•</span>
          <span>{internship.duration || "—"}</span>
          <span>•</span>
          <span>{internship.location || "—"}</span>
          <span>•</span>
          <span>
            Deadline:{" "}
            {internship.deadline
              ? new Date(internship.deadline).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </header>

      <section style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: 12 }}>
          Application tracking
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: "var(--space-sm)",
          }}
        >
          <StatCard label="Total applied" value={stats.total} color="#2297FA" />
          <StatCard label="In review" value={stats.applied} color="#8082D6" />
          <StatCard label="Shortlisted" value={stats.shortlisted} color="#50B6FE" />
          <StatCard label="Interview" value={stats.interview} color="#f59e0b" />
          <StatCard label="Selected" value={stats.selected} color="#16a34a" />
          <StatCard label="Rejected" value={stats.rejected} color="#dc2626" />
          <StatCard label="Offer issued" value={stats.offer} color="#059669" />
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <section
          style={{
            background: "white",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-xl)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: 12 }}>
            Description
          </h2>
          <p style={{ lineHeight: 1.7, color: "var(--color-muted)", whiteSpace: "pre-wrap" }}>
            {internship.description}
          </p>
        </section>

        <section
          style={{
            background: "white",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-xl)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: 12 }}>
            Eligibility & skills
          </h2>
          <p style={{ marginBottom: 8, fontSize: "var(--font-size-sm)" }}>
            <strong>Eligible batch / criteria:</strong> {eligibility.batch || "—"}
          </p>
          <p style={{ marginBottom: 8, fontSize: "var(--font-size-sm)" }}>
            <strong>Location mode:</strong> {eligibility.location || "—"}
          </p>
          <p style={{ marginBottom: 12, fontSize: "var(--font-size-sm)" }}>
            <strong>Application deadline:</strong>{" "}
            {eligibility.deadline
              ? new Date(eligibility.deadline).toLocaleDateString()
              : "—"}
          </p>
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: "var(--font-size-sm)" }}>
            Required skills
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(eligibility.skills || []).length > 0 ? (
              eligibility.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(34,151,250,0.1)",
                    color: "var(--color-primary)",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
                No skills listed
              </span>
            )}
          </div>
        </section>
      </div>

      <section
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "var(--space-lg)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
            Applicants ({applications.length})
          </h2>
        </div>
        {applications.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            No students have applied yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-background)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Student</th>
                <th style={{ padding: "12px 16px" }}>Email</th>
                <th style={{ padding: "12px 16px" }}>CGPA</th>
                <th style={{ padding: "12px 16px" }}>Department</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>Applied</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={`${app.source}-${app.id}`} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>{app.studentName}</td>
                  <td style={{ padding: "14px 16px", color: "var(--color-muted)" }}>{app.email}</td>
                  <td style={{ padding: "14px 16px" }}>{app.cgpa ?? "—"}</td>
                  <td style={{ padding: "14px 16px" }}>{app.department || app.stream || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 700,
                        background:
                          app.status === "rejected"
                            ? "rgba(239,68,68,0.1)"
                            : app.status === "selected" || app.status === "offer_issued"
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(34,151,250,0.1)",
                        color:
                          app.status === "rejected"
                            ? "#dc2626"
                            : app.status === "selected" || app.status === "offer_issued"
                              ? "#16a34a"
                              : "#2297FA",
                      }}
                    >
                      {statusLabel(app.status)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-muted)" }}>
                    {app.appliedAt
                      ? new Date(app.appliedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    {app.studentUserId ? (
                      <Link
                        href={`/profile/${app.studentUserId}`}
                        style={{ color: "var(--color-primary)", fontWeight: 600 }}
                      >
                        View profile →
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
