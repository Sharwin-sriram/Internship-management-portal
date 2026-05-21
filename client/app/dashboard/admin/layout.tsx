"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import AdminSidebar from "../../../components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
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
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #eef6ff 0%, #f9fafc 40%, #f0f7ff 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          maxWidth: 1450,
          margin: "0 auto",
          padding: "1.5rem 0.5rem 4rem",
        }}
      >
        <AdminSidebar />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
