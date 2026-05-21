"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { postAuthJson } from "../../../../lib/api";
import {
  FiArrowLeft,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import Link from "next/link";

export default function PostInternshipPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    skills: "",
    stipend_min: "",
    stipend_max: "",
    duration: "",
    location: "remote",
    deadline: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && user.role !== "company")
      router.push("/dashboard");
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const skillsArr = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: form.title,
        description: form.description,
        skills_required: skillsArr,
        stipend_min: Number(form.stipend_min || 0),
        stipend_max: Number(form.stipend_max || 0),
        duration: form.duration,
        location: form.location,
        deadline: form.deadline,
      };

      const res = await postAuthJson<{ success: boolean; message?: string }>(
        "/internships",
        payload,
      );

      if (res.ok && res.body?.success) {
        alert("Internship created successfully");
        router.push("/dashboard/company");
      } else {
        setError(res.body?.message || "Failed to create internship");
      }
    } catch (err) {
      setError("An unexpected error occurred while creating the internship");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
    );
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 0 3rem" }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/dashboard/company"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--color-muted)",
            textDecoration: "none",
            marginBottom: "1rem",
            fontWeight: 600,
            fontSize: "var(--font-size-sm)",
          }}
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 800,
            margin: "0 0 0.5rem",
          }}
        >
          Post a New Internship
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "1rem", margin: 0 }}>
          Fill out the details below to publish a new internship listing.
        </p>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-2xl)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius)",
              color: "#dc2626",
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "1.5rem" }}
        >
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: "var(--font-size-sm)",
                color: "var(--color-foreground)",
              }}
            >
              Internship Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  color: "var(--color-muted)",
                }}
              >
                <FiBriefcase />
              </div>
              <input
                required
                placeholder="e.g. Frontend Developer Intern"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-background)",
                  fontSize: "var(--font-size-base)",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: "var(--font-size-sm)",
                color: "var(--color-foreground)",
              }}
            >
              Description <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              required
              rows={6}
              placeholder="Describe the responsibilities, expectations, and learning opportunities..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-base)",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: "var(--font-size-sm)",
                color: "var(--color-foreground)",
              }}
            >
              Required Skills
            </label>
            <input
              placeholder="e.g. React, Node.js, Typescript (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-base)",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label
                style={{
                  fontWeight: 600,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-foreground)",
                }}
              >
                Minimum Stipend <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    color: "var(--color-muted)",
                  }}
                >
                  <FiDollarSign />
                </div>
                <input
                  required
                  type="number"
                  placeholder="e.g. 10000"
                  value={form.stipend_min}
                  onChange={(e) =>
                    setForm({ ...form, stipend_min: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                    fontSize: "var(--font-size-base)",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label
                style={{
                  fontWeight: 600,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-foreground)",
                }}
              >
                Maximum Stipend <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    color: "var(--color-muted)",
                  }}
                >
                  <FiDollarSign />
                </div>
                <input
                  required
                  type="number"
                  placeholder="e.g. 20000"
                  value={form.stipend_max}
                  onChange={(e) =>
                    setForm({ ...form, stipend_max: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                    fontSize: "var(--font-size-base)",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label
                style={{
                  fontWeight: 600,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-foreground)",
                }}
              >
                Duration <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    color: "var(--color-muted)",
                  }}
                >
                  <FiCalendar />
                </div>
                <input
                  required
                  placeholder="e.g. 3 months"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                    fontSize: "var(--font-size-base)",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label
                style={{
                  fontWeight: 600,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-foreground)",
                }}
              >
                Location Type <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    color: "var(--color-muted)",
                  }}
                >
                  <FiMapPin />
                </div>
                <select
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                    fontSize: "var(--font-size-base)",
                    appearance: "none",
                  }}
                >
                  <option value="remote">Remote</option>
                  <option value="on-site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: "var(--font-size-sm)",
                color: "var(--color-foreground)",
              }}
            >
              Application Deadline <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              required
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-base)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 32px",
                background: submitting
                  ? "var(--color-primary-60)"
                  : "var(--gradient-brand)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                fontWeight: 700,
                fontSize: "var(--font-size-base)",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(34, 151, 250, 0.25)",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
            >
              {submitting ? "Publishing..." : "Publish Internship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
