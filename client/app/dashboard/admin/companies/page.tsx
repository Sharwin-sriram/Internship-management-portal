"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Button from "../../../../components/ui/Button";
import {
  fetchCompanies,
  fetchCompanyRequests,
  updateCompanyApproval,
  type CompanyRecord,
} from "../../../../services/adminApi";

type Tab = "all" | "pending" | "approved" | "rejected";

function AdminCompaniesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "all";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "pending") {
        const res = await fetchCompanyRequests("pending");
        setCompanies(res.data ?? []);
      } else {
        const res = await fetchCompanies();
        let list = res.data ?? [];
        if (tab !== "all") {
          list = list.filter((c) => c.approval_status === tab);
        }
        setCompanies(list);
      }
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApproval(id: string, status: "approved" | "rejected") {
    if (!isAdmin && user?.role !== "coordinator") return;
    setActionId(id);
    try {
      await updateCompanyApproval(id, status);
      await load();
    } catch {
      /* ignore */
    } finally {
      setActionId(null);
    }
  }

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    const name = (c.company_name || c.legal_name || "").toLowerCase();
    const email = (c.primary_contact?.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>
          Companies
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
          View and manage company registrations and approvals.
        </p>
      </header>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: "var(--space-md)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1.5px solid",
              borderColor: tab === t.id ? "#50B6FE" : "var(--color-border)",
              background: tab === t.id ? "rgba(80,182,254,0.12)" : "white",
              fontWeight: tab === t.id ? 700 : 500,
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Search by company name or email…"
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
            Loading companies…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            No companies found.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-background)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Company</th>
                <th style={{ padding: "12px 16px" }}>Industry</th>
                <th style={{ padding: "12px 16px" }}>Contact</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                    {c.company_name || c.legal_name || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-muted)" }}>
                    {c.industry || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-muted)" }}>
                    {c.primary_contact?.email || "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={c.approval_status} />
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    {c.approval_status === "pending" && (
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={actionId === c._id}
                          onClick={() => handleApproval(c._id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={actionId === c._id}
                          onClick={() => handleApproval(c._id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Link
                      href={`/dashboard/admin/companies/${c._id}`}
                      style={{
                        color: "var(--color-primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      View profile →
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

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Loading companies…</div>}>
      <AdminCompaniesContent />
    </Suspense>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: "rgba(245,158,11,0.12)", color: "#d97706" },
    approved: { bg: "rgba(34,197,94,0.12)", color: "#16a34a" },
    rejected: { bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
  };
  const s = styles[status || "pending"] ?? styles.pending;
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
      {status || "pending"}
    </span>
  );
}
