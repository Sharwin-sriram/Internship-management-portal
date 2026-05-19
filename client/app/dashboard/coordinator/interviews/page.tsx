"use client";

import React, { useState } from "react";
import { FiCalendar, FiSearch, FiFilter, FiUsers, FiCheckCircle, FiClock, FiAward, FiTrendingUp } from "react-icons/fi";
import InterviewCard from "../../../../components/interviews/InterviewCard";
import Table from "../../../../components/ui/Table";

export default function CoordinatorInterviewsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "scheduled" | "completed">("all");
  const [filterCompany, setFilterCompany] = useState<"all" | string>("all");

  const analytics = [
    { label: "Total Interviews", value: 42, icon: <FiUsers size={24} />, color: "#2297FA", bg: "rgba(34,151,250,0.12)" },
    { label: "Pending Invitations", value: 15, icon: <FiClock size={24} />, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { label: "Completed", value: 24, icon: <FiCheckCircle size={24} />, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { label: "Selected Students", value: 8, icon: <FiAward size={24} />, color: "#8082D6", bg: "rgba(128,130,214,0.12)" },
  ];

  const interviews = [
    { id: "1", company: "TechGlobal", student: "John Doe", role: "Frontend Developer", date: "2026-05-22", time: "10:00 AM", type: "Video", status: "scheduled" },
    { id: "2", company: "Acme Corp", student: "Jane Smith", role: "Software Engineer", date: "2026-05-23", time: "02:00 PM", type: "In-person", status: "pending" },
    { id: "3", company: "DataCorp", student: "Mike Johnson", role: "Data Analyst", date: "2026-05-24", time: "11:00 AM", type: "Phone", status: "scheduled" },
    { id: "4", company: "InnovaTech", student: "Emily Chen", role: "UI/UX Designer", date: "2026-05-20", time: "03:00 PM", type: "Video", status: "completed" },
    { id: "5", company: "CloudTech", student: "David Lee", role: "DevOps Engineer", date: "2026-05-25", time: "09:00 AM", type: "Video", status: "pending" },
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
        };
        const style = colors[value] || colors.scheduled;
        return (
          <span style={{ padding: "4px 12px", borderRadius: 999, background: style.bg, color: style.text, fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {value}
          </span>
        );
      }
    },
  ];

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = search === "" || 
      interview.company.toLowerCase().includes(search.toLowerCase()) ||
      interview.student.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || interview.status === filterStatus;
    const matchesCompany = filterCompany === "all" || interview.company === filterCompany;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 1400, margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(148,174,254,0.1)", color: "#94AEFE", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-sm)" }}>
          <FiTrendingUp size={14} /> Coordinator Dashboard
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-md)" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "var(--space-xs)" }}>
              Global Interviews Overview
            </h1>
            <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-base)", fontWeight: 500 }}>
              Monitor all interview activities across companies and students
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-2xl)" }}>
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
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "var(--radius-lg)", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)", fontWeight: 600, marginBottom: 4 }}>{stat.label}</p>
              <h3 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, lineHeight: 1 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-lg)", border: "1px solid var(--color-border)", marginBottom: "var(--space-xl)" }}>
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
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{ padding: "10px 16px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-background)", fontSize: "var(--font-size-sm)" }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-background)", fontSize: "var(--font-size-sm)" }}
          >
            <option value="all">All Companies</option>
            <option value="TechGlobal">TechGlobal</option>
            <option value="Acme Corp">Acme Corp</option>
            <option value="DataCorp">DataCorp</option>
            <option value="InnovaTech">InnovaTech</option>
          </select>
        </div>
      </div>

      {/* Interviews Table */}
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ padding: "var(--space-lg)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>All Interviews</h2>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
            {filteredInterviews.length} interviews found
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

      {/* Recent Activity */}
      <div style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-lg)", display: "flex", alignItems: "center", gap: 8 }}>
          <FiCalendar /> Recent Activity
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--space-lg)" }}>
          {interviews.slice(0, 4).map((interview) => (
            <InterviewCard
              key={interview.id}
              companyName={interview.company}
              jobTitle={interview.role}
              date={interview.date}
              time={interview.time}
              interviewType={interview.type.toLowerCase() as any}
              interviewerName="Coordinator"
              status={interview.status.toLowerCase() as any}
              showActions={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
