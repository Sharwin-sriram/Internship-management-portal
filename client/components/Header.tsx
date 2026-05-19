"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isDashboardRoute = pathname.startsWith("/dashboard");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = user
    ? [{ href: "/dashboard", label: "Dashboard" }]
    : isDashboardRoute
      ? [{ href: "/", label: "Home" }]
      : [
          { href: "/", label: "Home" },
          { href: "/login", label: "Sign in" },
        ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: 64,
        background: scrolled
          ? "rgba(255,255,255,0.92)"
          : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid var(--color-border)"
          : "1px solid transparent",
        transition:
          "background var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base)",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          padding: "0 var(--space-lg)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(34,151,250,0.3)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "var(--font-size-lg)",
              background: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            InternHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--color-muted)",
                  background: isActive
                    ? "var(--color-primary-10)"
                    : "transparent",
                  transition: "all var(--transition-fast)",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}
            >
              <NotificationBell />
              <Link
                href="/profile"
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 12px 4px 4px",
                    borderRadius: 999,
                    background: "var(--color-primary-10)",
                    border: "1px solid var(--color-primary-20)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--gradient-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 700,
                      overflow: "hidden",
                    }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() ?? "U"
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                    }}
                  >
                    {user.name}
                  </span>
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </div>
          ) : (
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
