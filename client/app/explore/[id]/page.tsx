"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPublicJson } from "../../../lib/api";
import Button from "../../../components/ui/Button";
import { FiArrowLeft, FiBriefcase, FiCalendar, FiMapPin } from "react-icons/fi";
import type { ExploreInternship } from "../page";

export default function ExploreInternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  const [internship, setInternship] = useState<ExploreInternship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    const res = await getPublicJson<{
      success: boolean;
      data?: ExploreInternship;
      message?: string;
    }>(`/internships/${encodeURIComponent(id)}`);
    if (res.ok && res.body?.success && res.body.data) {
      setInternship(res.body.data);
    } else {
      setInternship(null);
      setError(res.body?.message || "Internship not found.");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const company =
    internship?.company && typeof internship.company === "object"
      ? internship.company
      : null;
  const companyName = company?.company_name?.trim() || "Company";

  const applyHref = internship
    ? `/dashboard/student/applications/apply?job=${encodeURIComponent(internship.title)}&internshipId=${encodeURIComponent(internship._id)}`
    : "#";

  return (
    <div
      style={{
        background: "var(--color-background)",
        minHeight: "100vh",
        padding: "var(--space-2xl) var(--space-lg)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/explore"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--color-muted)",
            textDecoration: "none",
            fontWeight: 600,
            marginBottom: "var(--space-xl)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <FiArrowLeft /> Back to Explore
        </Link>

        {loading && (
          <div style={{ textAlign: "center", color: "var(--color-muted)" }}>
            Loading…
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius)",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {!loading && internship && (
          <article
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--color-border)",
              padding: "var(--space-2xl)",
            }}
          >
            <p
              style={{
                color: "var(--color-muted)",
                fontWeight: 600,
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--space-sm)",
              }}
            >
              {companyName}
            </p>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                marginBottom: "var(--space-lg)",
                lineHeight: 1.2,
              }}
            >
              {internship.title}
            </h1>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-md)",
                marginBottom: "var(--space-xl)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-muted)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FiMapPin />{" "}
                {internship.location === "remote"
                  ? "Remote"
                  : internship.location === "on-site"
                    ? "On-site"
                    : internship.location === "hybrid"
                      ? "Hybrid"
                      : internship.location || "—"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FiBriefcase /> {internship.duration?.trim() || "—"}
              </span>
              {internship.deadline && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FiCalendar /> Apply by{" "}
                  {new Date(internship.deadline).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </span>
              )}
            </div>

            {internship.skills_required &&
              internship.skills_required.length > 0 && (
                <div style={{ marginBottom: "var(--space-xl)" }}>
                  <h2
                    style={{
                      fontSize: "var(--font-size-base)",
                      fontWeight: 700,
                      marginBottom: "var(--space-sm)",
                    }}
                  >
                    Skills
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {internship.skills_required.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: "var(--font-size-xs)",
                          fontWeight: 600,
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: "var(--color-border)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <h2
              style={{
                fontSize: "var(--font-size-base)",
                fontWeight: 700,
                marginBottom: "var(--space-sm)",
              }}
            >
              About this role
            </h2>
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.65,
                color: "var(--color-foreground)",
                marginBottom: "var(--space-xl)",
              }}
            >
              {internship.description || "No description provided."}
            </p>

            <Button variant="primary" onClick={() => router.push(applyHref)}>
              Apply now
            </Button>
          </article>
        )}
      </div>
    </div>
  );
}
