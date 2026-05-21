"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard/company", label: "Overview", exact: true },
  { href: "/dashboard/company/applicants", label: "Applicants" },
  {
    href: "/dashboard/company/interviews/schedule",
    label: "Schedule Interviews",
  },
  { href: "/dashboard/company/calendar", label: "Interview Calendar" },
  { href: "/dashboard/company/recruiters", label: "Recruiting Team" },
  { href: "/dashboard/company/talent", label: "Talent Search" },
  { href: "/dashboard/company/analytics", label: "Analytics" },
  { href: "/dashboard/company/offer-letters", label: "Offer Letters" },
];

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function CompanySidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: 260, minWidth: 220, padding: "1.5rem 0 1.5rem 0.1rem" }}
    >
      <div style={{ position: "sticky", top: 90 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(148,174,254,0.2)",
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
            Company
          </p>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
            aria-label="Company navigation"
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
                    fontWeight: active ? 700 : 600,
                    color: active ? "#1d4ed8" : "#0f172a",
                    background: active ? "rgba(59,130,246,0.1)" : "transparent",
                    border: active
                      ? "1px solid rgba(59,130,246,0.2)"
                      : "1px solid transparent",
                    transition: "all 0.2s ease",
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
