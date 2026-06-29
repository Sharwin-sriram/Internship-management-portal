"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import {
  fetchAdminUsers,
  updateUserRole,
  type AdminUser,
} from "../../../../services/adminApi";

const ROLES = ["student", "company", "coordinator", "admin", "interviewer"];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAdminUsers();
        setUsers(res.data ?? []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRoleChange(userId: string, newRole: string) {
    if (!isAdmin) return;
    setSavingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          (u._id || u.id) === userId ? { ...u, role: newRole } : u,
        ),
      );
    } catch {
      /* ignore */
    } finally {
      setSavingId(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>
          All Users
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
          Manage platform users and roles.
          {!isAdmin && " (Role changes require admin access)"}
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "var(--space-md)" }}>
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 240px",
            padding: "10px 14px",
            borderRadius: "var(--radius)",
            border: "1.5px solid var(--color-border)",
            fontSize: "var(--font-size-sm)",
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius)",
            border: "1.5px solid var(--color-border)",
            fontSize: "var(--font-size-sm)",
            minWidth: 140,
          }}
        >
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

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
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--color-muted)" }}>
            No users found.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-background)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Name</th>
                <th style={{ padding: "12px 16px" }}>Email</th>
                <th style={{ padding: "12px 16px" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const id = u._id || u.id || "";
                return (
                  <tr key={id} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: "14px 16px", color: "var(--color-muted)" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {isAdmin ? (
                        <select
                          value={u.role}
                          disabled={savingId === id}
                          onChange={(e) => handleRoleChange(id, e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--radius)",
                            border: "1.5px solid var(--color-border)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "rgba(80,182,254,0.12)",
                            fontWeight: 600,
                            fontSize: "var(--font-size-xs)",
                            textTransform: "capitalize",
                          }}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
