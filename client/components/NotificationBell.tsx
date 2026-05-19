"use client";

import React, { useState, useRef, useEffect } from "react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "Upcoming Interview", desc: "You have an interview with Acme Corp tomorrow at 10:00 AM.", time: "1 hour ago", unread: true },
    { id: 2, title: "Interview Feedback", desc: "Feedback for John Doe has been submitted.", time: "3 hours ago", unread: true },
    { id: 3, title: "New Invitation", desc: "TechGlobal has sent you an interview invite.", time: "1 day ago", unread: false },
  ];

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
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
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}>Mark all as read</span>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "16px",
                  borderBottom: "1px solid var(--color-border)",
                  background: n.unread ? "var(--color-primary-10)" : "transparent",
                  cursor: "pointer",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-10)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = n.unread ? "var(--color-primary-10)" : "transparent")}
              >
                <h4 style={{ margin: "0 0 4px 0", fontSize: "var(--font-size-sm)", fontWeight: 600 }}>{n.title}</h4>
                <p style={{ margin: "0 0 6px 0", fontSize: "var(--font-size-sm)", color: "var(--color-muted)", lineHeight: 1.4 }}>{n.desc}</p>
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-muted)" }}>{n.time}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px", textAlign: "center", background: "var(--color-background)", borderTop: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", cursor: "pointer", fontWeight: 600 }}>View all notifications</span>
          </div>
        </div>
      )}
    </div>
  );
}
