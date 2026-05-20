"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import * as authApi from "../../services/authApi";
import { getErrorMessage } from "../../lib/axios";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("err");
      setMessage(
        "This link is invalid. Open your profile and send a new verification email.",
      );
      return;
    }

    let cancelled = false;
    (async () => {
      setStatus("loading");
      setMessage("Verifying your email…");
      try {
        const res = await authApi.confirmEmailVerification(token);
        if (cancelled) return;
        if (res.success) {
          setStatus("ok");
          setMessage(res.message || "Your email is verified.");
          await refreshUser();
          window.setTimeout(() => router.push("/profile"), 2000);
        } else {
          setStatus("err");
          setMessage(res.message || "Verification failed.");
        }
      } catch (e) {
        if (cancelled) return;
        setStatus("err");
        setMessage(
          getErrorMessage(e, "Verification failed. The link may have expired."),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, refreshUser]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-xl)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800 }}>
        Student email verification
      </h1>
      <p
        style={{
          marginTop: "var(--space-md)",
          maxWidth: 420,
          color: "var(--color-muted)",
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {status === "loading" ? null : (
        <Link
          href="/profile"
          style={{
            marginTop: "var(--space-lg)",
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          Back to profile
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "var(--space-xl)", textAlign: "center" }}>
          Loading…
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
