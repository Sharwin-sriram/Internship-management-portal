"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard/admin", label: "Overview", exact: true },
  { href: "/dashboard/admin/internships", label: "Internships" },
  { href: "/dashboard/admin/companies", label: "Companies" },
  { href: "/dashboard/admin/students", label: "Students" },
];

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  const hasMoreSpecificMatch = items.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(href) &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
  if (hasMoreSpecificMatch) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{ width: 260, minWidth: 220, padding: "1.5rem 0 1.5rem 0.1rem" }}>
      <div style={{ position: "sticky", top: 90 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(80,182,254,0.25)",
            boxShadow: "0 10px 26px rgba(15,23,42,0.08)",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#94a3b8",
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            Admin Portal
          </p>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
            aria-label="Admin navigation"
          >
            {items.map((item) => {
              const active = isNavActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: "none",
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: "0.9rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#1d4ed8" : "#475569",
                    background: active ? "rgba(80,182,254,0.12)" : "transparent",
                    border: active
                      ? "1px solid rgba(80,182,254,0.35)"
                      : "1px solid transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
