"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { FiCalendar, FiSearch, FiUsers, FiCheckCircle, FiClock, FiAward, FiTrendingUp } from "react-icons/fi";
import InterviewCard from "../../../../components/interviews/InterviewCard";
import Table from "../../../../components/ui/Table";
import * as interviewApi from "../../../../services/interviewApi";
import { interviewToCardProps } from "../../../../lib/interviewMappers";
import { useProtectedRoute } from "../../../../hooks/useProtectedRoute";
import { useInterviewSocket } from "../../../../context/InterviewSocketContext";
import type { InterviewRecord } from "../../../../types/interview";

function rowFromInterview(doc: InterviewRecord) {
  const app =
    typeof doc.application === "object" && doc.application ? doc.application : null;
  const company =
    (typeof doc.company === "object" && doc.company?.company_name) ||
    app?.internship?.company?.company_name ||
    "—";
  const student = app?.student?.user?.name || "—";
  const role = app?.internship?.title || "—";
  const d = new Date(doc.scheduled_at);
  const date = d.toISOString().slice(0, 10);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const type =
    doc.interview_type === "in-person" ? "In-person" : doc.interview_type === "phone" ? "Phone" : "Video";
  return {
    id: doc._id,
    company,
    student,
    role,
    date,
    time,
    type,
    status: doc.status,
  };
}

export default function CoordinatorInterviewsPage() {
  useProtectedRoute(["coordinator", "admin"]);
  const { subscribe } = useInterviewSocket();
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "scheduled" | "completed">("all");
  const [filterCompany, setFilterCompany] = useState<"all" | string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await interviewApi.listInterviewsLegacy();
      setRecords(list);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const off = subscribe("interview:feedback_submitted", () => load());
    return () => off();
  }, [subscribe, load]);

  const stats = useMemo(() => interviewApi.computeInterviewStats(records), [records]);

  const companyOptions = useMemo(() => {
    const names = new Set<string>();
    records.forEach((doc) => {
      const app = typeof doc.application === "object" && doc.application ? doc.application : null;
      const c =
        (typeof doc.company === "object" && doc.company?.company_name) ||
        app?.internship?.company?.company_name;
      if (c) names.add(c);
    });
    return Array.from(names).sort();
  }, [records]);

  const tableRows = useMemo(() => records.map(rowFromInterview), [records]);

  const filteredInterviews = useMemo(() => {
    return tableRows.filter((interview) => {
      const matchesSearch =
        search === "" ||
        interview.company.toLowerCase().includes(search.toLowerCase()) ||
        interview.student.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || interview.status === filterStatus;
      const matchesCompany = filterCompany === "all" || interview.company === filterCompany;
      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [tableRows, search, filterStatus, filterCompany]);

  const analytics = [
    { label: "Total interviews", value: stats.total, icon: <FiUsers size={24} />, color: "#2297FA", bg: "rgba(34,151,250,0.12)" },
    { label: "Pending / active", value: stats.pending, icon: <FiClock size={24} />, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { label: "Completed", value: stats.completed, icon: <FiCheckCircle size={24} />, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { label: "With feedback", value: stats.completed, icon: <FiAward size={24} />, color: "#8082D6", bg: "rgba(128,130,214,0.12)" },
  ];

  const columns = [
    { key: "company" as const, label: "Company" },
    { key: "student" as const, label: "Student" },
    { key: "role" as const, label: "Position" },
    { key: "date" as const, label: "Date" },
    { key: "time" as const, label: "Time" },
    { key: "type" as const, label: "Type" },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
          scheduled: { bg: "rgba(34,151,250,0.1)", text: "#2297FA" },
          pending: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
          completed: { bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
          accepted: { bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
        };
        const style = colors[value] || colors.scheduled;
        return (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              background: style.bg,
              color: style.text,
              fontSize: "var(--font-size-xs)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {value}
          </span>
        );
      },
    },
  ];

  const recentCards = useMemo(() => records.slice(0, 4).map(interviewToCardProps), [records]);

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 1400, margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(148,174,254,0.1)",
            color: "#94AEFE",
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "var(--space-sm)",
          }}
        >
          <FiTrendingUp size={14} /> Coordinator dashboard
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-md)" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "var(--space-xs)" }}>
              Global interviews overview
            </h1>
            <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-base)", fontWeight: 500 }}>
              Live data from GET /api/interviews?legacy=1
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        {analytics.map((stat, i) => (
          <div
            key={i}
            className={`delay-${(i + 1) * 100} animate-fade-in-up`}
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-lg)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-md)",
              transition: "transform var(--transition-base), box-shadow var(--transition-base)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-lg)",
                background: stat.bg,
                color: stat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)", fontWeight: 600, marginBottom: 4 }}>{stat.label}</p>
              <h3 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, lineHeight: 1 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-lg)",
          border: "1px solid var(--color-border)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
            <input
              type="text"
              placeholder="Search by company or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 40px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-sm)",
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <option value="all">All companies</option>
            {companyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            padding: "var(--space-lg)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>All interviews</h2>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
            {loading ? "Loading…" : `${filteredInterviews.length} interviews`}
          </span>
        </div>
        <Table
          columns={columns}
          data={filteredInterviews}
          emptyMessage="No interviews found matching your criteria"
          hoverable
          striped
        />
      </div>

      <div style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-lg)", display: "flex", alignItems: "center", gap: 8 }}>
          <FiCalendar /> Recent
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--space-lg)" }}>
          {recentCards.map((int) => {
            const { id, ...card } = int;
            return <InterviewCard key={id} {...card} showActions={false} />;
          })}
        </div>
      </div>
    </div>
  );
}
