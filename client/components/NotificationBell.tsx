"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import * as notificationApi from "../services/notificationApi";

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<notificationApi.NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await notificationApi.listNotifications({ limit: 30 });
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) load();
  }, [isOpen, user, load]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = items.some((n) => !n.is_read);

  const markAll = async () => {
    try {
      await notificationApi.markAllNotificationsRead();
      await load();
    } catch {
      /* ignore */
    }
  };

  const markOne = async (id: string) => {
    try {
      await notificationApi.markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)));
    } catch {
      /* ignore */
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "50%",
          transition: "background var(--transition-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-10)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {hasUnread && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              width: 8,
              height: 8,
              background: "var(--color-error)",
              borderRadius: "50%",
              boxShadow: "0 0 0 2px white",
            }}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="animate-fade-in-up"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            width: 320,
            background: "white",
            borderRadius: "var(--radius)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            border: "1px solid var(--color-border)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: 600 }}>Notifications</h3>
            <button
              type="button"
              onClick={markAll}
              style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500, background: "none", border: "none" }}
            >
              Mark all read
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {loading && (
              <div style={{ padding: 16, color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>Loading…</div>
            )}
            {!loading && items.length === 0 && (
              <div style={{ padding: 16, color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>No notifications yet</div>
            )}
            {items.map((n) => (
              <div
                key={n._id}
                role="button"
                tabIndex={0}
                onClick={() => !n.is_read && markOne(n._id)}
                onKeyDown={(e) => e.key === "Enter" && !n.is_read && markOne(n._id)}
                style={{
                  padding: "16px",
                  borderBottom: "1px solid var(--color-border)",
                  background: !n.is_read ? "var(--color-primary-10)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <h4 style={{ margin: "0 0 4px 0", fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
                  {n.title || n.event_type}
                </h4>
                <p style={{ margin: "0 0 6px 0", fontSize: "var(--font-size-sm)", color: "var(--color-muted)", lineHeight: 1.4 }}>
                  {n.message || ""}
                </p>
                {n.action_url && (
                  <Link
                    href={(() => {
                      try {
                        const u = new URL(n.action_url);
                        return `${u.pathname}${u.search}`;
                      } catch {
                        return n.action_url.startsWith("/") ? n.action_url : "/dashboard";
                      }
                    })()}
                    style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary)" }}
                  >
                    Open
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
