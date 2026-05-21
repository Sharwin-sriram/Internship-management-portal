"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button";
import { API_BASE } from "../../../lib/axios";

function AdminLoginForm() {
  const { user, login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      router.replace(redirect);
    }
  }, [user, authLoading, router, redirect]);

  async function handleSeedDemo() {
    setSeeding(true);
    setSeedMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/seed-demo`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEmail(data.email);
        setSeedMessage(`Demo account ready. Password: ${data.password}`);
      } else {
        setError(data.message || "Could not create demo admin");
      }
    } catch {
      setError("Cannot reach API server. Start the backend (npm run dev in server folder).");
    } finally {
      setSeeding(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await login(email.trim().toLowerCase(), password, "admin");
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    router.push(redirect);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-xl) var(--space-lg)",
        background:
          "radial-gradient(circle at 20% 20%, rgba(80,182,254,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(34,151,250,0.1) 0%, transparent 50%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-xl)",
          padding: "var(--space-2xl)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #50B6FE 0%, #2297FA 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-md)",
              boxShadow: "0 8px 24px rgba(34,151,250,0.35)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: 800,
              marginBottom: "var(--space-xs)",
              letterSpacing: "-0.02em",
            }}
          >
            Private Admin Access
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
            Restricted area — authorized personnel only
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Admin email
          </label>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-admin@email.com"
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "var(--radius)",
              border: "1.5px solid var(--color-border)",
              fontSize: "var(--font-size-base)",
              marginBottom: "var(--space-md)",
              outline: "none",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative", marginBottom: "var(--space-lg)" }}>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "12px 44px 12px 14px",
                borderRadius: "var(--radius)",
                border: "1.5px solid var(--color-border)",
                fontSize: "var(--font-size-base)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-muted)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius)",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#dc2626",
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--space-md)",
              }}
            >
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            Sign in
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <div style={{ marginTop: "var(--space-md)" }}>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              loading={seeding}
              onClick={handleSeedDemo}
            >
              Create / reset demo admin in database
            </Button>
            {seedMessage && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: "var(--font-size-xs)",
                  color: "#16a34a",
                  textAlign: "center",
                }}
              >
                {seedMessage}
              </p>
            )}
          </div>
        )}

        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              marginTop: "var(--space-md)",
              padding: "12px 14px",
              borderRadius: "var(--radius)",
              background: "var(--color-background)",
              border: "1px dashed var(--color-border)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-muted)",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--color-foreground)" }}>Demo credentials</strong>
            <br />
            Email: admin@internhub.com
            <br />
            Password: Admin@123
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
