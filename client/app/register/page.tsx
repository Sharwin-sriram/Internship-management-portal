"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { postJson } from '../../lib/api';
import { AuthUser, saveAuth } from '../../lib/auth';
import { signIn } from 'next-auth/react';
import { startOAuth } from '../../lib/oauth';

/* ─── SVG Icons ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.336 0 3.327 2.682 1.386 6.586L5.266 9.765z" />
      <path fill="#34A853" d="M16.04 15.345c-1.127.755-2.545 1.2-4.04 1.2a5.08 5.08 0 0 1-4.873-3.418l-3.9 3.018C5.127 19.89 8.327 22 12 22c2.973 0 5.673-1.018 7.69-2.782l-3.65-3.873z" />
      <path fill="#4285F4" d="M23.49 12.273c0-.818-.082-1.6-.218-2.363H12v4.51h6.46c-.29 1.48-1.145 2.736-2.42 3.563l3.65 3.873c2.136-1.973 3.8-4.882 3.8-8.582z" />
      <path fill="#FBBC05" d="M7.127 13.127A5.044 5.044 0 0 1 6.818 12c0-.39.064-.773.182-1.136L3.1 7.845A9.875 9.875 0 0 0 2 12c0 1.536.355 2.99 1.018 4.29l3.9-3.018z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" />
      <line x1="8" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ─── Logo SVG ────────────────────────────────────────────── */
function LogoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

/* ─── Types ──────────────────────────────────────────────── */
type Role = "student" | "company";

interface CompanyRegisterResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

/* ─── Main Component ─────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [industry, setIndustry] = useState("");
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const loadIndustries = async () => {
      const res = await getJson<{ success: boolean; data: { name: string }[] }>(
        "/industries",
      );
      if (res.ok && res.body?.success) {
        setIndustryOptions(
          res.body.data.map((item) => item.name).filter(Boolean),
        );
      }
    };

    if (role === "company") {
      loadIndustries();
    } else {
      setIndustry("");
      setIsCustomIndustry(false);
    }
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    if (role === "company") {
      if (!industry.trim()) {
        setError("Please select an industry.");
        setLoading(false);
        return;
      }

      const payload = {
        name,
        email,
        password,
        company_name: companyName,
        industry,
      };

      const res = await postJson<CompanyRegisterResponse>(
        "/companies/register",
        payload,
      );
      setLoading(false);

      if (res.ok && res.body?.success) {
        const authUser = { ...res.body.user, token: res.body.token };
        saveAuth(authUser);
        setSuccess("Company registered! Redirecting…");
        setTimeout(() => router.push("/dashboard/company"), 500);
        return;
      }

      const b = res.body as { error?: string; message?: string } | null;
      setError(
        b?.error ?? b?.message ?? "Registration failed. Please try again.",
      );
      return;
    }

    const res = await postJson("/auth/register", { name, email, password });
    setLoading(false);

    if (res.ok) {
      setSuccess("Account created! Redirecting…");
      setTimeout(() => router.push("/register/success"), 800);
    } else {
      const b = res.body as { error?: string; message?: string } | null;
      setError(
        b?.error ?? b?.message ?? "Registration failed. Please try again.",
      );
    }
  }

  /* ─── Shared Styles ──────────────────────────────────── */
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
    letterSpacing: "0.01em",
  };

  const inputWrapperStyle = (
    fieldId: string,
    hasError?: boolean,
  ): React.CSSProperties => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    border: `1.5px solid ${
      hasError
        ? "rgba(239,68,68,0.6)"
        : focusedField === fieldId
          ? "var(--color-primary, #2297FA)"
          : "#e4eaf3"
    }`,
    borderRadius: 10,
    background: "#fff",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow:
      focusedField === fieldId
        ? "0 0 0 3px rgba(34,151,250,0.12)"
        : hasError
          ? "0 0 0 3px rgba(239,68,68,0.08)"
          : "none",
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "13px 16px 13px 44px",
    fontSize: "0.9375rem",
    fontFamily: "var(--font-sans)",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "var(--color-foreground, #111827)",
    borderRadius: 10,
  };

  const iconInInputStyle: React.CSSProperties = {
    position: "absolute",
    left: 14,
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    transition: "color 0.2s ease",
  };

  const roleButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 10,
    border: active
      ? "1.5px solid rgba(34,151,250,0.65)"
      : "1.5px solid #e4eaf3",
    background: active ? "rgba(34,151,250,0.08)" : "#fff",
    color: active ? "#2297FA" : "#6b7280",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9375rem",
    fontFamily: "var(--font-sans)",
  });

  return (
    <>
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBg {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bg-orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none; z-index: 0;
          animation: floatBg 8s ease-in-out infinite;
        }
        .reg-card {
          animation: cardEntrance 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer;
          padding: 8px 12px; color: #9ca3af;
          display: flex; align-items: center;
          transition: color 0.2s ease;
        }
        .eye-btn:hover { color: #6b7280; }
        .security-badge {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 20px;
          font-size: 0.75rem; color: #9ca3af; font-weight: 500;
        }
        /* ── Submit button: outline at rest, solid fill on hover ── */
        .submit-btn-outline {
          width: 100%; padding: 14px 24px;
          font-size: 1rem; font-weight: 700;
          border-radius: 10px; cursor: pointer;
          font-family: var(--font-sans); letter-spacing: 0.02em;
          transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background-color: transparent;
          color: #2297FA;
          border: 2px solid #2297FA;
        }
        .submit-btn-outline:not(:disabled):hover {
          background-color: #2297FA;
          border-color: #2297FA;
          color: #fff;
        }
        .submit-btn-outline:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        /* loading state — show filled */
        .submit-btn-outline.is-loading {
          background-color: #2297FA;
          border-color: #2297FA;
          color: #fff;
        }
        .social-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 12px 16px; border-radius: 10px;
          font-weight: 600; font-size: 0.9rem; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.2s ease;
          background: #fff; border: 1.5px solid #e4eaf3; color: #374151;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
          width: 100%;
        }
        .social-btn:hover {
          background: #f9fafb; border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          background:
            "linear-gradient(135deg, #f0f4ff 0%, #f7f9fc 50%, #eef6ff 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background orbs */}
        <div
          className="bg-orb"
          style={{
            width: 320,
            height: 320,
            top: -80,
            right: -80,
            background: "rgba(34,151,250,0.10)",
          }}
        />
        <div
          className="bg-orb"
          style={{
            width: 240,
            height: 240,
            bottom: -60,
            left: -60,
            background: "rgba(128,130,214,0.08)",
            animationDelay: "4s",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 480,
          }}
        >
          {/* ─── Card ────────────────────────────────────── */}
          <div
            className="reg-card"
            style={{
              width: "100%",
              background: "#ffffff",
              borderRadius: 24,
              padding: "2.5rem",
              boxShadow:
                "0 20px 60px rgba(34,151,250,0.14), 0 4px 12px rgba(0,0,0,0.08)",
              border: "1.5px solid rgba(34,151,250,0.12)",
              position: "relative",
            }}
          >
            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background:
                    "linear-gradient(135deg, #2297FA 0%, #8082D6 100%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(34,151,250,0.35)",
                }}
              >
                <LogoIcon />
              </div>
            </div>

            {/* Title */}
            <h1
              style={{
                textAlign: "center",
                margin: "0 0 6px",
                fontSize: "1.625rem",
                fontWeight: 800,
                color: "var(--color-foreground, #111827)",
              }}
            >
              Create an account
            </h1>
            <p
              style={{
                textAlign: "center",
                margin: "0 0 28px",
                fontSize: "0.875rem",
                color: "#6b7280",
                lineHeight: 1.5,
              }}
            >
              Join InternHub as a student or company — it&apos;s completely
              free.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 0 }}
            >
              {/* Role selector */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>I am a…</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    style={roleButtonStyle(role === "student")}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("company")}
                    style={roleButtonStyle(role === "company")}
                  >
                    🏢 Company
                  </button>
                </div>
              </div>

              {/* Full Name / Contact Name */}
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="reg-name" style={labelStyle}>
                  {role === "company" ? "Contact Name" : "Full Name"}
                </label>
                <div style={inputWrapperStyle("name")}>
                  <span style={iconInInputStyle}>
                    <UserIcon />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder={
                      role === "company" ? "Your name" : "Your full name"
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={inputStyle}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Company Name (conditional) */}
              {role === "company" && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="reg-company" style={labelStyle}>
                      Company Name (optional)
                    </label>
                    <div style={inputWrapperStyle("company")}>
                      <span style={iconInInputStyle}>
                        <BuildingIcon />
                      </span>
                      <input
                        id="reg-company"
                        type="text"
                        placeholder="Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        onFocus={() => setFocusedField("company")}
                        onBlur={() => setFocusedField(null)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="reg-industry" style={labelStyle}>
                      Industry
                    </label>
                    {!isCustomIndustry ? (
                      <div style={inputWrapperStyle("industry")}>
                        <span style={iconInInputStyle}>
                          <BuildingIcon />
                        </span>
                        <select
                          id="reg-industry"
                          value={
                            industryOptions.includes(industry) ? industry : ""
                          }
                          onChange={(e) => {
                            const nextIndustry = e.target.value;
                            if (nextIndustry === "Custom") {
                              setIsCustomIndustry(true);
                              setIndustry("");
                              return;
                            }
                            setIndustry(nextIndustry);
                          }}
                          onFocus={() => setFocusedField("industry")}
                          onBlur={() => setFocusedField(null)}
                          required
                          style={{
                            ...inputStyle,
                            appearance: "none",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            background: "transparent",
                            paddingRight: 16,
                          }}
                        >
                          <option value="" disabled>
                            Select industry
                          </option>
                          {industryOptions.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={inputWrapperStyle("industry-custom")}>
                          <span style={iconInInputStyle}>
                            <BuildingIcon />
                          </span>
                          <input
                            id="reg-industry"
                            type="text"
                            placeholder="Enter custom industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            onFocus={() => setFocusedField("industry-custom")}
                            onBlur={() => setFocusedField(null)}
                            required
                            style={inputStyle}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomIndustry(false);
                            setIndustry("");
                          }}
                          style={{
                            alignSelf: "start",
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid #e4eaf3",
                            background: "#fff",
                            color: "#374151",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Choose a preset industry
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginBottom: 18,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(34,151,250,0.08)",
                      border: "1px solid rgba(34,151,250,0.18)",
                      color: "#1e3a8a",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    You can complete company details after login. It only takes
                    a minute.
                  </div>
                </>
              )}

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="reg-email" style={labelStyle}>
                  Email address
                </label>
                <div style={inputWrapperStyle("email")}>
                  <span style={iconInInputStyle}>
                    <MailIcon />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <label
                    htmlFor="reg-password"
                    style={{ ...labelStyle, margin: 0 }}
                  >
                    Password
                  </label>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "#9ca3af",
                      fontWeight: 500,
                    }}
                  >
                    At least 8 characters
                  </span>
                </div>
                <div style={inputWrapperStyle("password")}>
                  <span style={iconInInputStyle}>
                    <LockIcon />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="reg-confirm" style={labelStyle}>
                  Confirm Password
                </label>
                <div
                  style={inputWrapperStyle(
                    "confirm",
                    !!error && error.includes("match"),
                  )}
                >
                  <span style={iconInInputStyle}>
                    <LockIcon />
                  </span>
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: "11px 14px",
                    borderRadius: 10,
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "#dc2626",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    animation: "fadeSlideDown 0.3s ease both",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: "11px 14px",
                    borderRadius: 10,
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.22)",
                    color: "#15803d",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    animation: "fadeSlideDown 0.3s ease both",
                  }}
                >
                  {success}
                </div>
              )}

              {/* Submit — outline at rest, fill on hover */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className={`submit-btn-outline${loading ? " is-loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </button>

              {/* Social Registration Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Or continue with
                </span>
                <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
              </div>

              {/* Social Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    document.cookie = `oauth_role=${role}; path=/; max-age=300`;
                    signIn('google', { callbackUrl: '/auth/callback' });
                  }}
                  className="social-btn"
                >
                  <GoogleIcon /> Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => startOAuth('github', role)}
                  className="social-btn"
                >
                  <GithubIcon /> Continue with GitHub
                </button>
              </div>

              {/* Footer link */}
              <p
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  style={{
                    color: "#2297FA",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              </p>
            </form>

            {/* Security badge */}
            <div className="security-badge">
              <ShieldIcon />
              <span>256-bit SSL encrypted · Secured by InternHub</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
