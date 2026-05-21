"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import { getPublicJson } from "../../lib/api";
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiFilter,
  FiDollarSign,
} from "react-icons/fi";

type CompanyRef = {
  _id?: string;
  company_name?: string;
  logo_url?: string;
};

export type ExploreInternship = {
  _id: string;
  title: string;
  description?: string;
  company?: CompanyRef | null;
  stipend_min: number;
  stipend_max: number;
  duration?: string;
  location?: string;
  skills_required?: string[];
  deadline?: string;
};

const AVATAR_STYLES = [
  { color: "#2297FA", bg: "rgba(34,151,250,0.1)" },
  { color: "#8082D6", bg: "rgba(128,130,214,0.1)" },
  { color: "#50B6FE", bg: "rgba(80,182,254,0.1)" },
  { color: "#94AEFE", bg: "rgba(148,174,254,0.1)" },
  { color: "#7ED8FA", bg: "rgba(126,216,250,0.1)" },
];

function styleForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 997;
  return AVATAR_STYLES[h % AVATAR_STYLES.length];
}

function formatLocation(location?: string) {
  if (!location) return "—";
  const map: Record<string, string> = {
    remote: "Remote",
    "on-site": "On-site",
    hybrid: "Hybrid",
  };
  return map[location] ?? location;
}

function formatStipend(min: number, max: number) {
  const fmt = (n: number) =>
    `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}/mo`;
  if (min === max) return fmt(min);
  return `${fmt(min)} – ${fmt(max)}`;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [internships, setInternships] = useState<ExploreInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const router = useRouter();

  const loadInternships = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const res = await getPublicJson<{
      success: boolean;
      data?: ExploreInternship[];
      message?: string;
    }>("/internships");
    if (res.ok && res.body?.success && Array.isArray(res.body.data)) {
      setInternships(res.body.data);
    } else {
      setInternships([]);
      setLoadError(
        res.body?.message ||
          (res.ok ? "Could not load internships." : "Unable to reach server."),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadInternships();
  }, [loadInternships]);

  const filteredInternships = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return internships;
    return internships.filter((i) => {
      const companyName =
        (i.company && typeof i.company === "object"
          ? i.company.company_name
          : "") || "";
      const skills = (i.skills_required || []).join(" ").toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        companyName.toLowerCase().includes(q) ||
        skills.includes(q)
      );
    });
  }, [internships, searchQuery]);

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <section
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "var(--space-2xl) var(--space-lg)",
        }}
      >
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-md)",
            }}
          >
            Explore Internships
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-lg)",
              color: "var(--color-muted)",
              maxWidth: 600,
              marginBottom: "var(--space-xl)",
            }}
          >
            Discover opportunities that match your skills and career goals.
            Apply with a single click and track your applications seamlessly.
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--space-sm)",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: "1 1 300px",
                maxWidth: 600,
              }}
            >
              <FiSearch
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search by role, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-background)",
                  fontSize: "var(--font-size-base)",
                  outline: "none",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-primary)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </div>
            <Button
              variant="secondary"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <FiFilter /> Filters
            </Button>
          </div>
        </div>
      </section>

      <section style={{ padding: "var(--space-2xl) var(--space-lg)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          {loadError && !loading && (
            <div
              style={{
                padding: "1rem 1.25rem",
                marginBottom: "var(--space-lg)",
                borderRadius: "var(--radius)",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#b91c1c",
                fontWeight: 500,
              }}
            >
              {loadError}
            </div>
          )}

          <div
            style={{
              marginBottom: "var(--space-lg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700 }}>
              {loading
                ? "Loading opportunities…"
                : `${filteredInternships.length} opportunit${filteredInternships.length === 1 ? "y" : "ies"} found`}
            </h2>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "var(--space-3xl)",
                color: "var(--color-muted)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "3px solid var(--color-primary)",
                  borderTopColor: "transparent",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "var(--space-lg)",
              }}
            >
              {filteredInternships.map((internship) => {
                const company =
                  internship.company &&
                  typeof internship.company === "object"
                    ? internship.company
                    : null;
                const companyName = company?.company_name?.trim() || "Company";
                const logoUrl = company?.logo_url?.trim();
                const letter =
                  companyName.charAt(0).toUpperCase() || "?";
                const avatar = styleForId(internship._id);
                const tags = internship.skills_required?.length
                  ? internship.skills_required
                  : ["See description"];
                const applyHref = `/dashboard/student/applications/apply?job=${encodeURIComponent(internship.title)}&internshipId=${encodeURIComponent(internship._id)}`;

                return (
                  <div
                    key={internship._id}
                    className="animate-fade-in-up"
                    style={{
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--color-border)",
                      padding: "var(--space-xl)",
                      transition:
                        "transform var(--transition-base), box-shadow var(--transition-base)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-20)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor =
                        "var(--color-border)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-md)",
                        marginBottom: "var(--space-md)",
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "var(--radius-lg)",
                          background: avatar.bg,
                          color: avatar.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          letter
                        )}
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "var(--font-size-lg)",
                            fontWeight: 700,
                            marginBottom: 4,
                            lineHeight: 1.2,
                          }}
                        >
                          {internship.title}
                        </h3>
                        <div
                          style={{
                            color: "var(--color-muted)",
                            fontSize: "var(--font-size-sm)",
                            fontWeight: 500,
                          }}
                        >
                          {companyName}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "var(--space-sm)",
                        marginBottom: "var(--space-lg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-subtle)",
                          background: "var(--color-background)",
                          padding: "4px 10px",
                          borderRadius: 999,
                        }}
                      >
                        <FiMapPin /> {formatLocation(internship.location)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-subtle)",
                          background: "var(--color-background)",
                          padding: "4px 10px",
                          borderRadius: 999,
                        }}
                      >
                        <FiDollarSign />{" "}
                        {formatStipend(
                          internship.stipend_min,
                          internship.stipend_max,
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-subtle)",
                          background: "var(--color-background)",
                          padding: "4px 10px",
                          borderRadius: 999,
                        }}
                      >
                        <FiBriefcase />{" "}
                        {internship.duration?.trim() || "Duration TBD"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: "var(--space-xl)",
                        flex: 1,
                      }}
                    >
                      {tags.slice(0, 8).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 600,
                            color: "var(--color-foreground)",
                            background: "var(--color-border)",
                            padding: "4px 10px",
                            borderRadius: 6,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                      <Button
                        variant="primary"
                        style={{ flex: 1 }}
                        onClick={() => router.push(applyHref)}
                      >
                        Apply Now
                      </Button>
                      <Button
                        variant="secondary"
                        style={{ flex: 1 }}
                        onClick={() =>
                          router.push(`/explore/${internship._id}`)
                        }
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredInternships.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-3xl) 0",
                color: "var(--color-muted)",
              }}
            >
              <FiSearch
                size={48}
                style={{ opacity: 0.2, marginBottom: "var(--space-md)" }}
              />
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                No internships found
              </h3>
              <p>
                {internships.length === 0
                  ? "Check back soon for new listings from companies."
                  : "Try adjusting your search query or filters."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
