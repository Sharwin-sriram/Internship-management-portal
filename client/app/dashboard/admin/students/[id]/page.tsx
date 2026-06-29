"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { fetchStudentProfile, updateUserApprovalStatus, type StudentProfileForAdmin } from "../../../../../services/adminApi";
import Button from "../../../../../components/ui/Button";

export default function AdminStudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string;

  const [profile, setProfile] = useState<StudentProfileForAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!studentId) return;
      try {
        const res = await fetchStudentProfile(studentId);
        if (res.success) {
          setProfile(res.data);
        } else {
          setError("Failed to load student profile");
        }
      } catch (err) {
        setError("Error loading student profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  const handleApproval = async (status: "approved" | "rejected") => {
    if (!profile) return;
    setActionLoading(true);
    try {
      await updateUserApprovalStatus(profile.user._id, status);
      setProfile(prev => prev ? { ...prev, user: { ...prev.user, approval_status: status } } : null);
    } catch (err) {
      console.error("Error updating approval:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "var(--space-xl)", textAlign: "center" }}>
        Loading student profile…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div>
        <Link href="/dashboard/admin/students" style={{ color: "var(--color-primary)", marginBottom: "var(--space-lg)", display: "inline-block" }}>
          ← Back to Students
        </Link>
        <div style={{ 
          padding: "var(--space-xl)",
          background: "rgba(244,67,54,0.1)",
          color: "#F44336",
          borderRadius: "var(--radius)",
          marginTop: "var(--space-lg)"
        }}>
          {error || "Student profile not found"}
        </div>
      </div>
    );
  }

  const { user, student, verification } = profile;
  const statusColors: Record<string, { bg: string; text: string }> = {
    approved: { bg: "rgba(76,175,80,0.1)", text: "#4CAF50" },
    rejected: { bg: "rgba(244,67,54,0.1)", text: "#F44336" },
    pending: { bg: "rgba(255,193,7,0.1)", text: "#FFC107" },
  };

  const statusColor = statusColors[user.approval_status] || statusColors.pending;

  return (
    <div>
      <Link 
        href="/dashboard/admin/students"
        style={{ 
          color: "var(--color-primary)", 
          marginBottom: "var(--space-lg)", 
          display: "inline-block",
          fontWeight: 600,
          fontSize: "var(--font-size-sm)"
        }}
      >
        ← Back to Students
      </Link>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-lg)",
        marginBottom: "var(--space-xl)"
      }}>
        {/* User Info Card */}
        <div style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-lg)"
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-md)" }}>
            User Information
          </h2>
          
          <div style={{ marginBottom: "var(--space-md)" }}>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Name
            </label>
            <p style={{ fontSize: "1rem", fontWeight: 600, marginTop: 4 }}>{user.name}</p>
          </div>

          <div style={{ marginBottom: "var(--space-md)" }}>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Email
            </label>
            <p style={{ fontSize: "0.95rem", marginTop: 4, wordBreak: "break-all" }}>{user.email}</p>
          </div>

          <div style={{ marginBottom: "var(--space-md)" }}>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Email Verified
            </label>
            <p style={{ marginTop: 4 }}>
              <span style={{
                display: "inline-block",
                background: user.emailVerified ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
                color: user.emailVerified ? "#4CAF50" : "#F44336",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "var(--font-size-sm)",
                fontWeight: 600
              }}>
                {user.emailVerified ? "✓ Verified" : "✗ Not Verified"}
              </span>
            </p>
          </div>

          <div>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Auth Provider
            </label>
            <p style={{ fontSize: "0.95rem", marginTop: 4, textTransform: "capitalize" }}>{user.authProvider}</p>
          </div>
        </div>

        {/* Approval Status Card */}
        <div style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-lg)"
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-md)" }}>
            Approval Status
          </h2>

          <div style={{ marginBottom: "var(--space-lg)" }}>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Current Status
            </label>
            <p style={{ marginTop: 8 }}>
              <span style={{
                display: "inline-block",
                background: statusColor.bg,
                color: statusColor.text,
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 700,
                textTransform: "capitalize"
              }}>
                {user.approval_status}
              </span>
            </p>
          </div>

          {verification.autoApproved && (
            <div style={{
              background: "rgba(76,175,80,0.1)",
              color: "#4CAF50",
              padding: "var(--space-md)",
              borderRadius: "var(--radius)",
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)"
            }}>
              ✓ Auto-approved (GitHub & LinkedIn connected)
            </div>
          )}

          <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-lg)" }}>
            {user.approval_status !== "approved" && (
              <Button
                variant="primary"
                loading={actionLoading}
                onClick={() => handleApproval("approved")}
              >
                Approve
              </Button>
            )}
            {user.approval_status !== "rejected" && (
              <Button
                variant="danger"
                disabled={actionLoading}
                onClick={() => handleApproval("rejected")}
              >
                Reject
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Student Profile Card */}
      <div style={{
        background: "white",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-lg)",
        marginBottom: "var(--space-lg)"
      }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-md)" }}>
          Academic Information
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--space-md)" }}>
          <div>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              College
            </label>
            <p style={{ fontSize: "0.95rem", marginTop: 4, fontWeight: 600 }}>{student.college}</p>
          </div>

          <div>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Branch
            </label>
            <p style={{ fontSize: "0.95rem", marginTop: 4, fontWeight: 600 }}>{student.branch}</p>
          </div>

          <div>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              CGPA
            </label>
            <p style={{ 
              fontSize: "0.95rem", 
              marginTop: 4, 
              fontWeight: 700,
              color: student.cgpa >= 3.0 ? "#4CAF50" : "#F44336"
            }}>
              {student.cgpa.toFixed(2)}
            </p>
          </div>

          <div>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Graduation Year
            </label>
            <p style={{ fontSize: "0.95rem", marginTop: 4, fontWeight: 600 }}>{student.graduation_year}</p>
          </div>
        </div>

        {student.bio && (
          <div style={{ marginTop: "var(--space-md)" }}>
            <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
              Bio
            </label>
            <p style={{ fontSize: "0.95rem", marginTop: 4, lineHeight: 1.5 }}>{student.bio}</p>
          </div>
        )}

        <div style={{ marginTop: "var(--space-md)" }}>
          <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
            Placement Eligible
          </label>
          <p style={{ marginTop: 4 }}>
            <span style={{
              display: "inline-block",
              background: student.placement_eligible ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
              color: student.placement_eligible ? "#4CAF50" : "#F44336",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600
            }}>
              {student.placement_eligible ? "✓ Yes" : "✗ No"}
            </span>
          </p>
        </div>
      </div>

      {/* Connections & Verification */}
      <div style={{
        background: "white",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-lg)",
        marginBottom: "var(--space-lg)"
      }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-md)" }}>
          Professional Connections
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                background: verification.hasGitHub ? "#333" : "rgba(0,0,0,0.1)",
                color: "white",
                borderRadius: "4px",
                fontSize: "var(--font-size-sm)",
                fontWeight: 700
              }}>
                {verification.hasGitHub ? "✓" : "✗"}
              </span>
              <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
                GitHub
              </label>
            </div>
            {student.github_url ? (
              <a 
                href={student.github_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-primary)",
                  fontSize: "0.9rem",
                  wordBreak: "break-all",
                  textDecoration: "none"
                }}
              >
                {student.github_url}
              </a>
            ) : (
              <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Not provided</p>
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                background: verification.hasLinkedIn ? "#0A66C2" : "rgba(0,0,0,0.1)",
                color: "white",
                borderRadius: "4px",
                fontSize: "var(--font-size-sm)",
                fontWeight: 700
              }}>
                {verification.hasLinkedIn ? "✓" : "✗"}
              </span>
              <label style={{ color: "var(--color-muted)", fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
                LinkedIn
              </label>
            </div>
            {student.linkedin_url ? (
              <a 
                href={student.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-primary)",
                  fontSize: "0.9rem",
                  wordBreak: "break-all",
                  textDecoration: "none"
                }}
              >
                {student.linkedin_url}
              </a>
            ) : (
              <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Not provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {student.skills && student.skills.length > 0 && (
        <div style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-lg)",
          marginBottom: "var(--space-lg)"
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-md)" }}>
            Skills
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
            {student.skills.map((skill, idx) => (
              <span key={idx} style={{
                background: "rgba(63,81,181,0.1)",
                color: "#3F51B5",
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 600
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {student.projects && student.projects.length > 0 && (
        <div style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-lg)"
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-md)" }}>
            Projects
          </h2>
          <div style={{ display: "grid", gap: "var(--space-md)" }}>
            {student.projects.map((project, idx) => (
              <div key={idx} style={{
                background: "var(--color-background)",
                padding: "var(--space-md)",
                borderRadius: "var(--radius)",
                borderLeft: "4px solid var(--color-primary)"
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{project.title}</h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  {project.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
