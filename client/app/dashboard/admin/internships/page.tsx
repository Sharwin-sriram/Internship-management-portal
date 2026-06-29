"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchAdminInternships,
  type AdminInternshipListItem,
} from "../../../../services/adminApi";

function formatStipend(min: number, max: number) {
  const f = (n: number) =>
    `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  return min === max ? `${f(min)}/mo` : `${f(min)} – ${f(max)}/mo`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    open: { bg: "rgba(34,197,94,0.12)", color: "#16a34a" },
    closed: { bg: "rgba(100,116,139,0.12)", color: "#475569" },
    draft: { bg: "rgba(245,158,11,0.12)", color: "#d97706" },
  };
  const s = styles[status] ?? styles.open;
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: "var(--font-size-xs)",
        fontWeight: 700,
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState<AdminInternshipListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAdminInternships();
        setInternships(res.data ?? []);
      } catch {
        setInternships([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = internships.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch =
      i.title.toLowerCase().includes(q) ||
      i.companyName.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>
          Internships management
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
          All internships posted on the portal — click one to view details and applicant tracking.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "var(--space-lg)" }}>
        <input
          type="search"
          placeholder="Search by title or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 240px",
            padding: "10px 14px",
            borderRadius: "var(--radius)",
            border: "1.5px solid var(--color-border)",
            fontSize: "var(--font-size-sm)",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius)",
            border: "1.5px solid var(--color-border)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

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
            Loading internships…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            No internships found.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-background)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Internship</th>
                <th style={{ padding: "12px 16px" }}>Company</th>
                <th style={{ padding: "12px 16px" }}>Stipend</th>
                <th style={{ padding: "12px 16px" }}>Applications</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: "14px 16px" }}>
                    {item.company?._id ? (
                      <Link
                        href={`/dashboard/admin/companies/${item.company._id}`}
                        style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
                      >
                        {item.companyName}
                      </Link>
                    ) : (
                      item.companyName
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-muted)" }}>
                    {formatStipend(item.stipend_min, item.stipend_max)}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                    {item.applicationCount}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Link
                      href={`/dashboard/admin/internships/${item._id}`}
                      style={{
                        color: "var(--color-primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      View details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
