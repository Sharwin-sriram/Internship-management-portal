"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminUsers, type AdminUser } from "../../../../services/adminApi";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAdminUsers("student");
        setStudents(res.data ?? []);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>
          Students
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
          View all registered student accounts on the platform.
        </p>
      </header>

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "10px 14px",
          borderRadius: "var(--radius)",
          border: "1.5px solid var(--color-border)",
          marginBottom: "var(--space-lg)",
          fontSize: "var(--font-size-sm)",
        }}
      />

      <div
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            Loading students…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            No students found.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-background)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Name</th>
                <th style={{ padding: "12px 16px" }}>Email</th>
                <th style={{ padding: "12px 16px" }}>Verified</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const id = s._id || s.id || "";
                return (
                  <tr key={id} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: "14px 16px", color: "var(--color-muted)" }}>
                      {s.email}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {s.emailVerified ? (
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>Yes</span>
                      ) : (
                        <span style={{ color: "var(--color-muted)" }}>No</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <Link
                        href={`/profile/${id}`}
                        style={{
                          color: "var(--color-primary)",
                          fontWeight: 600,
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p
        style={{
          marginTop: "var(--space-md)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-muted)",
        }}
      >
        Showing {filtered.length} of {students.length} students
      </p>
    </div>
  );
}
