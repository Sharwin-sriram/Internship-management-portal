"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    color: "#2297FA",
    bg: "rgba(34,151,250,0.08)",
    title: "Student Profiles",
    description:
      "Students register, build their profile, and track every application in one place.",
    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  },
  {
    color: "#8082D6",
    bg: "rgba(128,130,214,0.08)",
    title: "Company Listings",
    description:
      "Companies post internship openings and review applicants with ease.",
    icon: "M2 7h20v14H2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  },
  {
    color: "#50B6FE",
    bg: "rgba(80,182,254,0.08)",
    title: "Application Tracking",
    description:
      "Real-time status updates from applied → interviewed → placed.",
    icon: "M22 12l-4 0-3 9-6-18-3 9-4 0",
  },
  {
    color: "#94AEFE",
    bg: "rgba(148,174,254,0.08)",
    title: "Coordinator Tools",
    description:
      "Admins and coordinators get a full view of all placements and outcomes.",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  },
  {
    color: "#7ED8FA",
    bg: "rgba(126,216,250,0.08)",
    title: "Document Management",
    description:
      "Securely upload, store, and share resumes, offer letters, and certificates.",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H9 8",
  },
  {
    color: "#2297FA",
    bg: "rgba(34,151,250,0.08)",
    title: "Smart Notifications",
    description:
      "Stay in the loop with instant alerts on every application update.",
    icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  },
];

const stats = [
  { value: "500+", label: "Internships Posted" },
  { value: "2,000+", label: "Students Placed" },
  { value: "150+", label: "Partner Companies" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div style={{ overflowX: "hidden" }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          padding: "var(--space-3xl) var(--space-lg)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "-15%",
              right: "-10%",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(34,151,250,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "-5%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(128,130,214,0.10) 0%, transparent 70%)",
            }}
          />
        </div>

        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3xl)",
            alignItems: "center",
          }}
        >
          {/* Copy */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                background: "var(--color-primary-10)",
                border: "1px solid var(--color-primary-20)",
                marginBottom: "var(--space-lg)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Now in beta — free to join
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "var(--space-lg)",
                letterSpacing: "-0.03em",
              }}
            >
              Internships,{" "}
              <span
                style={{
                  background: "var(--gradient-brand)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                simplified.
              </span>
            </h1>

            <p
              style={{
                fontSize: "var(--font-size-lg)",
                color: "var(--color-muted)",
                lineHeight: 1.7,
                marginBottom: "var(--space-xl)",
                maxWidth: 480,
              }}
            >
              InternHub connects students with top companies and gives
              coordinators the tools to manage every placement — from
              application to offer letter.
            </p>

            <div
              style={{
                display: "flex",
                gap: "var(--space-md)",
                flexWrap: "wrap",
              }}
            >
              {user ? (
                user.role === "company" ? (
                  <Link
                    href="/dashboard"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 28px",
                      borderRadius: "var(--radius)",
                      background: "var(--gradient-brand)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "var(--font-size-base)",
                      border: "none",
                      boxShadow: "0 6px 20px rgba(34,151,250,0.40)",
                      letterSpacing: "0.01em",
                      textDecoration: "none",
                    }}
                  >
                    Go to Dashboard →
                  </Link>
                ) : (
                  <Link
                    href="/explore"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 28px",
                      borderRadius: "var(--radius)",
                      background: "var(--gradient-brand)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "var(--font-size-base)",
                      border: "none",
                      boxShadow: "0 6px 20px rgba(34,151,250,0.40)",
                      letterSpacing: "0.01em",
                      textDecoration: "none",
                    }}
                  >
                    Explore Internships →
                  </Link>
                )
              ) : (
                <>
                  <Link
                    href="/register"
                    id="cta-get-started"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 28px",
                      borderRadius: "var(--radius)",
                      background: "var(--gradient-brand)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "var(--font-size-base)",
                      border: "none",
                      boxShadow: "0 6px 20px rgba(34,151,250,0.40)",
                      letterSpacing: "0.01em",
                      textDecoration: "none",
                    }}
                  >
                    Get started free →
                  </Link>
                  <Link
                    href="/login"
                    id="cta-signin"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 28px",
                      borderRadius: "var(--radius)",
                      background: "white",
                      color: "var(--color-foreground)",
                      fontWeight: 600,
                      fontSize: "var(--font-size-base)",
                      border: "1.5px solid var(--color-border)",
                      textDecoration: "none",
                    }}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Illustration card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
              <div
                className="animate-float"
                style={{
                  background: "white",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-xl)",
                  boxShadow: "var(--shadow-xl)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: "var(--space-lg)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "var(--gradient-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Software Engineering Intern
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-muted)",
                      }}
                    >
                      Acme Corp · Remote
                    </div>
                  </div>
                </div>
                {[
                  ["Stipend", "₹25,000/mo"],
                  ["Duration", "3 months"],
                  ["Skills", "React, Node.js"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-muted)",
                      }}
                    >
                      {k}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: 600,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
                <Link
                  href="/explore"
                  style={{
                    marginTop: "var(--space-lg)",
                    padding: "10px",
                    borderRadius: "var(--radius)",
                    background: "var(--gradient-brand)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "var(--font-size-sm)",
                    textAlign: "center",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  Apply Now
                </Link>
              </div>

              {/* Floating badges */}
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  right: -20,
                  background: "white",
                  borderRadius: "var(--radius)",
                  padding: "10px 16px",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  24 new listings today
                </span>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -16,
                  left: -20,
                  background: "white",
                  borderRadius: "var(--radius)",
                  padding: "10px 16px",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2297FA"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Application submitted!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        style={{
          padding: "var(--space-2xl) var(--space-lg)",
          background: "white",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "var(--space-xl)",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(1.75rem,3vw,2.5rem)",
                  fontWeight: 800,
                  background: "var(--gradient-brand)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-muted)",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "var(--space-3xl) var(--space-lg)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          <div
            style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}
          >
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                color: "var(--color-primary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "var(--space-sm)",
              }}
            >
              Everything you need
            </p>
            <h2
              style={{
                fontSize: "clamp(1.75rem,4vw,2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "var(--space-md)",
              }}
            >
              Built for the full journey
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-lg)",
                color: "var(--color-muted)",
                maxWidth: 560,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              From first application to final placement, InternHub handles every
              step.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "var(--space-lg)",
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "white",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-xl)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                  transition:
                    "transform var(--transition-base), box-shadow var(--transition-base)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "var(--shadow-sm)";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius)",
                    background: f.bg,
                    color: f.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={f.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {f.icon.split(" M").map((d, i) => (
                      <path key={i} d={(i === 0 ? "" : "M") + d} />
                    ))}
                  </svg>
                </div>
                <h3
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: 700,
                    marginBottom: "var(--space-sm)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: "var(--space-3xl) var(--space-lg)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          <div
            style={{
              background: "var(--gradient-brand)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-3xl)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -60,
                left: -60,
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }}
            />
            <h2
              style={{
                fontSize: "clamp(1.75rem,4vw,2.5rem)",
                fontWeight: 800,
                color: "white",
                marginBottom: "var(--space-md)",
                letterSpacing: "-0.02em",
                position: "relative",
              }}
            >
              Ready to find your internship?
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-lg)",
                color: "rgba(255,255,255,0.8)",
                marginBottom: "var(--space-xl)",
                lineHeight: 1.7,
                maxWidth: 480,
                margin: "0 auto var(--space-xl)",
                position: "relative",
              }}
            >
              Join thousands of students and companies already using InternHub.
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--space-md)",
                justifyContent: "center",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              {user ? (
                user.role === "company" ? (
                  <Link
                    href="/dashboard"
                    style={{
                      padding: "14px 32px",
                      borderRadius: "var(--radius)",
                      background: "white",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      fontSize: "var(--font-size-base)",
                      textDecoration: "none",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/explore"
                    style={{
                      padding: "14px 32px",
                      borderRadius: "var(--radius)",
                      background: "white",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      fontSize: "var(--font-size-base)",
                      textDecoration: "none",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    Explore Internships
                  </Link>
                )
              ) : (
                <>
                  <Link
                    href="/register"
                    id="cta-bottom-register"
                    style={{
                      padding: "14px 32px",
                      borderRadius: "var(--radius)",
                      background: "white",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      fontSize: "var(--font-size-base)",
                      textDecoration: "none",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    Create your account
                  </Link>
                  <Link
                    href="/login"
                    id="cta-bottom-login"
                    style={{
                      padding: "14px 32px",
                      borderRadius: "var(--radius)",
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "var(--font-size-base)",
                      border: "1.5px solid rgba(255,255,255,0.35)",
                      textDecoration: "none",
                    }}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-xl) var(--space-lg)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-md)",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: "var(--font-size-sm)",
              background: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            InternHub
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-subtle)",
            }}
          >
            © 2026 InternHub. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
