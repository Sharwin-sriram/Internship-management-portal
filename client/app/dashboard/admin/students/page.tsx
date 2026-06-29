"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminStudents, updateUserApprovalStatus, type AdminStudentRow } from "../../../../services/adminApi";
import Button from "../../../../components/ui/Button";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const handleApproval = async (id: string, status: "approved" | "rejected") => {
    setActionId(id);
    try {
      await updateUserApprovalStatus(id, status);
      const res = await fetchAdminStudents();
      setStudents(res.data ?? []);
    } catch {
      // ignore
    } finally {
      setActionId(null);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAdminStudents();
        setStudents(res.data ?? []);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.college?.toLowerCase().includes(q) ||
      s.branch?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>
          Students
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
          Manage student profiles. Auto-approved when GitHub & LinkedIn are linked.
        </p>
      </header>

      <input
        type="search"
        placeholder="Search by name, email, college, or branch…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "10px 14px",
          borderRadius: "var(--radius)",
          border: "1.5px solid var(--color-border)",
          marginBottom: "var(--space-lg)",
          fontSize: "var(--font-size-sm)",
        }}
      />

      <div
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            Loading students…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            {students.length === 0 ? "No students found." : "No students match your search."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-background)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Name</th>
                <th style={{ padding: "12px 16px" }}>Email</th>
                <th style={{ padding: "12px 16px" }}>College</th>
                <th style={{ padding: "12px 16px" }}>CGPA</th>
                <th style={{ padding: "12px 16px" }}>Connections</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const id = s._id || s.id || "";
                return (
                  <tr key={id} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: "14px 16px", color: "var(--color-muted)", fontSize: "0.85rem" }}>
                      {s.email}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.9rem" }}>
                      {s.college} • {s.branch}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ 
                        background: s.cgpa && s.cgpa >= 3.0 ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
                        color: s.cgpa && s.cgpa >= 3.0 ? "#4CAF50" : "#F44336",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        fontWeight: 600
                      }}>
                        {s.cgpa?.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {s.hasGitHub && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#333",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}>
                            ✓ GitHub
                          </span>
                        )}
                        {s.hasLinkedIn && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#0A66C2",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}>
                            ✓ LinkedIn
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={s.approval_status} />
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                        {s.approval_status !== "approved" && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionId === id}
                            onClick={() => handleApproval(id, "approved")}
                          >
                            Approve
                          </Button>
                        )}
                        {s.approval_status !== "rejected" && (
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={actionId === id}
                            onClick={() => handleApproval(id, "rejected")}
                          >
                            Reject
                          </Button>
                        )}
                        <Link
                          href={`/dashboard/admin/students/${id}`}
                          style={{
                            color: "var(--color-primary)",
                            fontWeight: 600,
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: "var(--space-lg)", fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
        Showing {filtered.length} of {students.length} students
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    approved: { bg: "rgba(76,175,80,0.1)", text: "#4CAF50" },
    rejected: { bg: "rgba(244,67,54,0.1)", text: "#F44336" },
    pending: { bg: "rgba(255,193,7,0.1)", text: "#FFC107" },
  };

  const color = colors[status || "pending"] || colors.pending;

  return (
    <span style={{
      background: color.bg,
      color: color.text,
      padding: "6px 12px",
      borderRadius: "var(--radius)",
      fontSize: "var(--font-size-xs)",
      fontWeight: 600,
      textTransform: "capitalize",
      display: "inline-block",
    }}>
      {status || "pending"}
    </span>
  );
}
