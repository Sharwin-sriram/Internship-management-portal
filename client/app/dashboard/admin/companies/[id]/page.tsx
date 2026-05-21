"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAdminCompanyProfile } from "../../../../../services/adminApi";
import type { AdminInternshipListItem, CompanyRecord } from "../../../../../services/adminApi";

export default function AdminCompanyProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [owner, setOwner] = useState<{
    name: string;
    email: string;
    role: string;
    createdAt?: string;
  } | null>(null);
  const [internships, setInternships] = useState<AdminInternshipListItem[]>([]);
  const [stats, setStats] = useState({
    totalInternships: 0,
    openInternships: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchAdminCompanyProfile(id);
      if (res.data) {
        setCompany(res.data.company);
        setOwner(res.data.owner);
        setInternships(res.data.internships ?? []);
        setStats(res.data.stats);
      }
    } catch {
      setCompany(null);
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
        Loading company profile…
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <Link href="/dashboard/admin/companies" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          ← Back to companies
        </Link>
        <p style={{ marginTop: 16 }}>Company not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/admin/companies"
        style={{
          display: "inline-block",
          marginBottom: "var(--space-lg)",
          color: "var(--color-primary)",
          fontWeight: 600,
          textDecoration: "none",
          fontSize: "var(--font-size-sm)",
        }}
      >
        ← Back to companies
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
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-lg)" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "1.5rem",
            }}
          >
            {(company.company_name || "C").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>
              {company.company_name || company.legal_name}
            </h1>
            <p style={{ color: "var(--color-muted)", marginBottom: 8 }}>
              {company.industry || "—"} · {company.approval_status}
            </p>
            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary)", fontSize: "var(--font-size-sm)" }}
              >
                {company.website}
              </a>
            )}
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-md)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {[
          { label: "Internships posted", value: stats.totalInternships },
          { label: "Open listings", value: stats.openInternships },
          { label: "Total applications", value: stats.totalApplications },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "var(--space-lg)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#50B6FE" }}>{s.value}</div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

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
            Company details
          </h2>
          <dl style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.8 }}>
            <dt style={{ fontWeight: 700 }}>Legal name</dt>
            <dd style={{ margin: "0 0 12px", color: "var(--color-muted)" }}>
              {company.legal_name || "—"}
            </dd>
            <dt style={{ fontWeight: 700 }}>Industry</dt>
            <dd style={{ margin: "0 0 12px", color: "var(--color-muted)" }}>
              {company.industry || "—"}
            </dd>
            <dt style={{ fontWeight: 700 }}>Verification</dt>
            <dd style={{ margin: "0 0 12px", color: "var(--color-muted)" }}>
              {company.is_verified ? "Verified" : "Not verified"} · {company.approval_status}
            </dd>
            <dt style={{ fontWeight: 700 }}>Description</dt>
            <dd style={{ margin: 0, color: "var(--color-muted)" }}>
              {company.description || "No description provided."}
            </dd>
          </dl>
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
            Primary contact
          </h2>
          <dl style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.8 }}>
            <dt style={{ fontWeight: 700 }}>Name</dt>
            <dd style={{ margin: "0 0 12px", color: "var(--color-muted)" }}>
              {company.primary_contact?.name || owner?.name || "—"}
            </dd>
            <dt style={{ fontWeight: 700 }}>Email</dt>
            <dd style={{ margin: "0 0 12px", color: "var(--color-muted)" }}>
              {company.primary_contact?.email || owner?.email || "—"}
            </dd>
            <dt style={{ fontWeight: 700 }}>Phone</dt>
            <dd style={{ margin: "0 0 12px", color: "var(--color-muted)" }}>
              {company.primary_contact?.phone || "—"}
            </dd>
            {owner && (
              <>
                <dt style={{ fontWeight: 700 }}>Account owner</dt>
                <dd style={{ margin: 0, color: "var(--color-muted)" }}>
                  {owner.name} ({owner.email})
                </dd>
              </>
            )}
          </dl>
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
        <div style={{ padding: "var(--space-lg)", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
            Internships posted ({internships.length})
          </h2>
        </div>
        {internships.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            This company has not posted any internships yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-background)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Title</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>Applications</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>View</th>
              </tr>
            </thead>
            <tbody>
              {internships.map((item) => (
                <tr key={item._id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: "14px 16px", textTransform: "capitalize" }}>
                    {item.status}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                    {item.applicationCount ?? 0}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Link
                      href={`/dashboard/admin/internships/${item._id}`}
                      style={{ color: "var(--color-primary)", fontWeight: 600 }}
                    >
                      Open →
                    </Link>
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
