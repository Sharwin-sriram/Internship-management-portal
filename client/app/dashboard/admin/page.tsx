"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAdminUsers,
  fetchCompanies,
  fetchCompanyRequests,
  fetchAdminInternships,
  type AdminInternshipListItem,
} from "../../../services/adminApi";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    internships: 0,
    pendingCompanies: 0,
  });
  const [recentInternships, setRecentInternships] = useState<AdminInternshipListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [studentsRes, companiesRes, pendingRes, internshipsRes] =
          await Promise.all([
            fetchAdminUsers("student"),
            fetchCompanies(),
            fetchCompanyRequests("pending"),
            fetchAdminInternships(),
          ]);
        const internships = internshipsRes.data ?? [];
        setStats({
          students: studentsRes.count ?? studentsRes.data?.length ?? 0,
          companies: companiesRes.count ?? companiesRes.data?.length ?? 0,
          internships: internshipsRes.count ?? internships.length,
          pendingCompanies: pendingRes.count ?? pendingRes.data?.length ?? 0,
        });
        setRecentInternships(internships.slice(0, 5));
      } catch {
        /* keep zeros */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Internships posted",
      value: stats.internships,
      href: "/dashboard/admin/internships",
      color: "#50B6FE",
    },
    {
      label: "Students",
      value: stats.students,
      href: "/dashboard/admin/students",
      color: "#2297FA",
    },
    {
      label: "Companies",
      value: stats.companies,
      href: "/dashboard/admin/companies",
      color: "#8082D6",
    },
    {
      label: "Pending approvals",
      value: stats.pendingCompanies,
      href: "/dashboard/admin/companies?tab=pending",
      color: "#f59e0b",
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <p
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            color: "#50B6FE",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          Admin Dashboard
        </p>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          Welcome, {user?.name?.split(" ")[0] || "Admin"}
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-base)" }}>
          Manage internships, companies, and students across the portal.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            style={{
              textDecoration: "none",
              background: "white",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: card.color,
                marginBottom: 4,
              }}
            >
              {loading ? "—" : card.value}
            </div>
            <div style={{ fontWeight: 600, color: "var(--color-foreground)" }}>
              {card.label}
            </div>
          </Link>
        ))}
      </div>

      <section
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
            Internships posted now
          </h2>
          <Link
            href="/dashboard/admin/internships"
            style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}
          >
            View all →
          </Link>
        </div>
        {loading ? (
          <p style={{ color: "var(--color-muted)" }}>Loading…</p>
        ) : recentInternships.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>No internships posted yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentInternships.map((item) => (
              <Link
                key={item._id}
                href={`/dashboard/admin/internships/${item._id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  textDecoration: "none",
                  background: "var(--color-background)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--color-foreground)" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
                    {item.companyName} · {item.applicationCount} applications · {item.status}
                  </div>
                </div>
                <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>
                  Open →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-xl)",
        }}
      >
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: 16 }}>
          Quick actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          {[
            {
              title: "Internships management",
              desc: "View all posted internships and applicant tracking",
              href: "/dashboard/admin/internships",
            },
            {
              title: "Review company requests",
              desc: "Approve or reject new company registrations",
              href: "/dashboard/admin/companies?tab=pending",
            },
            {
              title: "Browse companies",
              desc: "Open company profiles and their listings",
              href: "/dashboard/admin/companies",
            },
            {
              title: "View all students",
              desc: "Browse registered student accounts",
              href: "/dashboard/admin/students",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              style={{
                textDecoration: "none",
                padding: "var(--space-lg)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
              }}
            >
              <h3 style={{ fontWeight: 700, marginBottom: 6, color: "var(--color-foreground)" }}>
                {action.title}
              </h3>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
