"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiDownload,
  FiMapPin,
  FiMail,
  FiBriefcase,
  FiAward,
  FiBookOpen,
  FiChevronLeft,
  FiCheckCircle,
} from "react-icons/fi";
import { SiGithub } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import Button from "../../../components/ui/Button";
import { getJson, downloadBlob } from "../../../lib/api";

interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  branch: string;
  college: string;
  cgpa: number;
  graduation_year: number;
  location: string;
  skills: string[];
  bio: string;
  projects: { title: string; desc: string }[];
  resume_id: string | null;
  resume_name: string | null;
  linkedin_url?: string;
  github_url?: string;
}

// Mock data for demonstration purposes
const mockStudentProfile = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.j@example.com",
  branch: "Computer Science & Engineering",
  college: "National Institute of Technology",
  cgpa: 9.2,
  graduation_year: 2026,
  location: "Bangalore, India",
  skills: [
    "React",
    "Node.js",
    "TypeScript",
    "MongoDB",
    "Python",
    "AWS",
    "Docker",
  ],
  bio: "Passionate software engineering student with a strong foundation in full-stack development. Experienced in building scalable web applications and eager to apply my skills in a challenging internship role.",
  projects: [
    {
      title: "E-Commerce Platform",
      desc: "Built a full-stack e-commerce app using MERN stack.",
    },
    {
      title: "AI Resume Analyzer",
      desc: "Created a Python script utilizing NLP to score resumes against job descriptions.",
    },
  ],
  resume_url: "#", // In a real app, this would be a real URL to download the resume
};

const ensureHttpsPrefix = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const publicSocialBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: "var(--radius)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 600,
  textDecoration: "none",
  transition: "opacity 0.15s",
};

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getJson<{ success: boolean; data: any }>(
          `/profile/${params.id}`,
        );
        if (res.ok && res.body?.success) {
          const { user, student, resume } = res.body.data;

          if (user && student) {
            setProfile({
              id: user._id,
              name: user.name || "Unknown User",
              email: user.email || "",
              emailVerified: Boolean(user.emailVerified),
              branch: student.branch || "",
              college: student.college || "",
              cgpa: student.cgpa || 0,
              graduation_year: student.graduation_year || 0,
              location: "India",
              skills: student.skills || [],
              bio: student.bio || "No bio provided.",
              projects: student.projects || [],
              resume_id: resume ? resume.id : null,
              resume_name: resume ? resume.original_name : null,
              linkedin_url: student.linkedin_url || "",
              github_url: student.github_url || "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  const handleDownloadResume = async () => {
    if (!profile?.resume_id) return;

    const blob = await downloadBlob(`/documents/${profile.resume_id}/download`);
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = profile.resume_name || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert("Unable to download resume. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid var(--color-primary)",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>
          Profile not found
        </h2>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "var(--space-2xl) var(--space-lg)",
      }}
    >
      {/* Navigation */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-muted)",
          }}
        >
          <FiChevronLeft /> Back
        </Button>
      </div>

      {/* Profile Header & Highlights */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2.5fr)",
          gap: "var(--space-2xl)",
          alignItems: "start",
        }}
      >
        {/* Left Column: Avatar and Quick Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
          }}
        >
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, #8082D6 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                fontWeight: 800,
                marginBottom: "var(--space-lg)",
                boxShadow: "var(--shadow-lg)",
                border: "4px solid var(--color-surface)",
              }}
            >
              {profile.name.charAt(0)}
            </div>

            <h1
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: 800,
                marginBottom: 8,
                lineHeight: 1.1,
              }}
            >
              {profile.name}
            </h1>
            <p
              style={{
                color: "var(--color-muted)",
                fontSize: "var(--font-size-base)",
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              {profile.branch}
            </p>

            <div
              style={{
                width: "100%",
                height: 1,
                background: "var(--color-border)",
                margin: "16px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
                textAlign: "left",
                color: "var(--color-muted)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <FiMail size={16} aria-hidden />
                  <span>{profile.email}</span>
                </div>
                {profile.emailVerified ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#15803d",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                    title="Email verified on InternHub"
                  >
                    <FiCheckCircle size={12} aria-hidden />
                    Verified
                  </span>
                ) : null}
                {profile.linkedin_url?.trim() ? (
                  <a
                    href={ensureHttpsPrefix(profile.linkedin_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...publicSocialBtn,
                      background: "#0A66C2",
                      color: "#fff",
                    }}
                    title="Open LinkedIn profile"
                  >
                    <FaLinkedinIn size={18} aria-hidden />
                    LinkedIn
                  </a>
                ) : null}
                {profile.github_url?.trim() ? (
                  <a
                    href={ensureHttpsPrefix(profile.github_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...publicSocialBtn,
                      background: "#24292f",
                      color: "#fff",
                    }}
                    title="Open GitHub profile"
                  >
                    <SiGithub size={18} aria-hidden />
                    GitHub
                  </a>
                ) : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FiMapPin size={16} /> {profile.location}
              </div>
            </div>

            <div style={{ width: "100%", marginTop: "var(--space-xl)" }}>
              {profile.resume_id ? (
                <Button
                  variant="primary"
                  onClick={handleDownloadResume}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <FiDownload /> Download Resume
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  disabled
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  No Resume Uploaded
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Skills */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xl)",
          }}
        >
          {/* Top Highlights: Skills */}
          <section
            style={{
              background: "var(--gradient-card)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-primary-20)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-md)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiBriefcase color="var(--color-primary)" /> Top Skills
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 600,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Academic Profile */}
          <section
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-lg)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiBookOpen color="var(--color-primary)" /> Academic Details
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-lg)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-muted)",
                    marginBottom: 4,
                  }}
                >
                  College / University
                </p>
                <strong style={{ fontSize: "var(--font-size-base)" }}>
                  {profile.college}
                </strong>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-muted)",
                    marginBottom: 4,
                  }}
                >
                  Graduation Year
                </p>
                <strong style={{ fontSize: "var(--font-size-base)" }}>
                  {profile.graduation_year}
                </strong>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-muted)",
                    marginBottom: 4,
                  }}
                >
                  CGPA
                </p>
                <strong
                  style={{
                    fontSize: "var(--font-size-base)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiAward color="#f59e0b" /> {profile.cgpa}
                </strong>
              </div>
            </div>
          </section>

          {/* About / Bio */}
          <section
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-md)",
              }}
            >
              About
            </h2>
            <p
              style={{
                color: "var(--color-muted)",
                lineHeight: 1.7,
                fontSize: "var(--font-size-base)",
              }}
            >
              {profile.bio}
            </p>
          </section>

          {/* Projects */}
          <section
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-md)",
              }}
            >
              Key Projects
            </h2>
            <div style={{ display: "grid", gap: "var(--space-md)" }}>
              {profile.projects.map((project, index) => (
                <div
                  key={index}
                  style={{
                    padding: "var(--space-md)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <h4 style={{ fontWeight: 700, marginBottom: 4 }}>
                    {project.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                    }}
                  >
                    {project.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
