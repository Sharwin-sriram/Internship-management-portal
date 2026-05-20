"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { getJson, putJson } from "../../lib/api";
import Button from "../../components/ui/Button";
import ResumeSection from "../../components/student/ResumeSection";
import ProficiencyBar from "../../components/ui/ProficiencyBar";
import {
  FiUser,
  FiMail,
  FiBookOpen,
  FiAward,
  FiStar,
  FiMapPin,
  FiBriefcase,
  FiLink,
  FiEdit3,
  FiSave,
  FiX,
  FiChevronRight,
  FiCamera,
} from "react-icons/fi";

type UserProfile = {
  name: string;
  email: string;
  role: string;
  avatar: string;
};

type StudentProfile = {
  college: string;
  branch: string;
  cgpa: number;
  graduation_year: number;
  skills: string[];
  skillProficiencies?: Record<string, number>;
  projects?: ProjectEntry[];
  placement_eligible: boolean;
};

type ProjectEntry = {
  title: string;
  desc: string;
};

type ResumeMeta = {
  id: string;
  original_name: string;
  version: number;
  mime_type: string;
  is_verified: boolean;
  uploaded_at: string;
  updatedAt: string;
};

type CompanyProfile = {
  name: string;
  legal_name?: string;
  description: string;
  website: string;
  location: string;
  industry: string;
  logo: string;
  size?: string;
  primary_contact?: {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
  };
  social_links?: { platform?: string; url?: string }[];
  office_locations?: {
    label?: string;
    address_line1?: string;
    city?: string;
    country?: string;
  }[];
};

const ensureHttpsPrefix = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const stripHttpsPrefix = (value: string) => value.replace(/^https?:\/\//i, "");

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form State
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  // Student State
  const [studentDetails, setStudentDetails] = useState<StudentProfile>({
    college: "",
    branch: "",
    cgpa: 0,
    graduation_year: new Date().getFullYear(),
    skills: [],
    placement_eligible: true,
  });
  type SkillEntry = { name: string; proficiency: number };
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);
  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>([]);
  const [resume, setResume] = useState<ResumeMeta | null>(null);

  // Company State
  const [companyDetails, setCompanyDetails] = useState<CompanyProfile>({
    name: "",
    legal_name: "",
    description: "",
    website: "",
    location: "",
    industry: "",
    logo: "",
    size: "",
    primary_contact: { name: "", email: "", phone: "", title: "" },
    social_links: [],
    office_locations: [],
  });
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const predefinedCompanySizes = ["1-10", "10-20", "20-50", "50-100", "Custom"];
  const isPredefinedCompanySize = (size?: string) =>
    Boolean(size && predefinedCompanySizes.includes(size));
  const [isCustomCompanySize, setIsCustomCompanySize] = useState(false);
  const isPredefinedIndustry = (industry?: string) =>
    Boolean(industry && industryOptions.includes(industry));
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [res, industriesRes] = await Promise.all([
        getJson<{
          success: boolean;
          data: {
            user: UserProfile;
            student?: StudentProfile;
            company?: CompanyProfile;
            resume?: ResumeMeta;
          };
        }>("/profile"),
        getJson<{ success: boolean; data: { name: string }[] }>("/industries"),
      ]);
      const nextIndustryOptions =
        industriesRes.ok && industriesRes.body?.success
          ? industriesRes.body.data.map((item) => item.name).filter(Boolean)
          : [];
      if (industriesRes.ok && industriesRes.body?.success) {
        setIndustryOptions(nextIndustryOptions);
      }
      if (res.ok && res.body?.success) {
        setUserName(res.body.data.user.name || "");
        setUserAvatar(res.body.data.user.avatar || "");
        if (res.body.data.student) {
          setStudentDetails(res.body.data.student);
          const fetchedSkills: string[] = res.body.data.student.skills || [];
          const profs: Record<string, number> =
            res.body.data.student.skillProficiencies ||
            res.body.data.student.skillProficiencies ||
            {};
          const entries = fetchedSkills.map((s: string) => ({
            name: s,
            proficiency: profs[s] ?? Math.min(95, 40 + s.length * 6),
          }));
          setSkillEntries(entries);
          setProjectEntries(
            Array.isArray(res.body.data.student.projects)
              ? res.body.data.student.projects.map((project) => ({
                  title: project.title || "",
                  desc: project.desc || "",
                }))
              : [],
          );
        }
        // If the profile endpoint returned limited company data, try fetching full company profile
        if (res.body.data.company) {
          // company from /api/profile is a simplified object; keep that but also try to fetch full company
          try {
            const full = await getJson<{ success: boolean; data: any }>(
              "/companies/me",
            );
            if (full.ok && full.body?.success) {
              const c = full.body.data;
              const nextSize = c.size || "";
              setIsCustomCompanySize(
                nextSize !== "" && !isPredefinedCompanySize(nextSize),
              );
              const nextIndustry = c.industry || "";
              setIsCustomIndustry(
                nextIndustry !== "" &&
                  !nextIndustryOptions.includes(nextIndustry),
              );
              setCompanyDetails({
                name:
                  c.company_name ||
                  c.legal_name ||
                  res.body.data.company.name ||
                  "",
                legal_name: c.legal_name || "",
                description: c.description || "",
                website: stripHttpsPrefix(c.website || ""),
                location:
                  (c.office_locations && c.office_locations[0]?.city) ||
                  res.body.data.company.location ||
                  "",
                industry: nextIndustry || res.body.data.company.industry || "",
                logo: c.logo_url || res.body.data.company.logo || "",
                size: nextSize,
                primary_contact: c.primary_contact || {
                  name: "",
                  email: "",
                  phone: "",
                  title: "",
                },
                social_links: c.social_links || [],
                office_locations: c.office_locations || [],
              });
            } else {
              const nextSize = res.body.data.company.size || "";
              setIsCustomCompanySize(
                nextSize !== "" && !isPredefinedCompanySize(nextSize),
              );
              const nextIndustry = res.body.data.company.industry || "";
              setIsCustomIndustry(
                nextIndustry !== "" &&
                  !nextIndustryOptions.includes(nextIndustry),
              );
              setCompanyDetails(res.body.data.company);
            }
          } catch (e) {
            const nextSize = res.body.data.company.size || "";
            setIsCustomCompanySize(
              nextSize !== "" && !isPredefinedCompanySize(nextSize),
            );
            const nextIndustry = res.body.data.company.industry || "";
            setIsCustomIndustry(
              nextIndustry !== "" &&
                !nextIndustryOptions.includes(nextIndustry),
            );
            setCompanyDetails(res.body.data.company);
          }
        }
        setResume(res.body.data.resume ?? null);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const payload: any = {
        name: userName,
        avatar: userAvatar,
      };

      if (user?.role === "student") {
        payload.studentDetails = {
          ...studentDetails,
          skills: skillEntries.map((s) => s.name),
          projects: projectEntries
            .filter((project) => project.title.trim() || project.desc.trim())
            .map((project) => ({
              title: project.title.trim(),
              desc: project.desc.trim(),
            })),
        };
        payload.studentSkillProficiencies = Object.fromEntries(
          skillEntries.map((s) => [s.name, s.proficiency]),
        );
      }

      let res;
      if (user?.role === "company") {
        // Save full company profile via companies API which supports legal_name, size, primary_contact, etc.
        const companyPayload: any = {
          company_name: companyDetails.name,
          legal_name: companyDetails.legal_name,
          industry: companyDetails.industry,
          size: companyDetails.size,
          website: ensureHttpsPrefix(companyDetails.website),
          primary_contact: companyDetails.primary_contact,
          description: companyDetails.description,
          social_links: companyDetails.social_links,
          office_locations: companyDetails.office_locations,
        };

        res = await putJson<{ success: boolean; data: any }>(
          "/companies/me",
          companyPayload,
        );
      } else {
        res = await putJson<{
          success: boolean;
          data: any;
          message?: string;
        }>("/profile", payload);
      }

      if (res.ok && res.body?.success) {
        setEditing(false);
        await refreshUser();
        await fetchProfile(); // Refresh
      } else {
        console.error("Save failed response", res);
        alert(res.body?.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Save error", error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading || loading || !user || !mounted) {
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

  const roleColors: Record<string, { bg: string; text: string }> = {
    student: { bg: "var(--color-primary-10)", text: "var(--color-primary)" },
    company: { bg: "rgba(128,130,214,0.1)", text: "#8082D6" },
    admin: { bg: "rgba(80,182,254,0.1)", text: "#50B6FE" },
    coordinator: { bg: "rgba(148,174,254,0.1)", text: "#94AEFE" },
  };
  const roleTheme = roleColors[user.role] || roleColors.student;

  return (
    <div
      className="animate-fade-in-up"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "var(--space-2xl) var(--space-lg)",
      }}
    >
      {/* Navigation */}
      <div style={{ marginBottom: "var(--space-md)" }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-muted)",
          }}
        >
          <FiChevronRight style={{ transform: "rotate(180deg)" }} /> Back to
          Dashboard
        </Button>
      </div>

      {/* Header Banner */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 160,
          borderRadius: "var(--radius-xl)",
          background: "var(--gradient-brand)",
          marginBottom: 80,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: 40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "var(--color-surface)",
            border: "4px solid var(--color-surface)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3rem",
            fontWeight: 800,
            color: "var(--color-primary)",
            overflow: "hidden",
          }}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
          {editing && (
            <label
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                transition: "opacity 0.2s",
                opacity: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
            >
              <FiCamera size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* Edit Toggle */}
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: 40,
            display: "flex",
            gap: "var(--space-sm)",
          }}
        >
          {!editing ? (
            <Button variant="primary" onClick={() => setEditing(true)}>
              <FiEdit3 /> Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
              >
                <FiX /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "var(--space-xl)",
        }}
      >
        {/* Core Info */}
        <section
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-xl)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              marginBottom: "var(--space-md)",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800 }}>
              {editing ? "Edit Profile" : userName}
            </h2>
            {!editing && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: roleTheme.bg,
                  color: roleTheme.text,
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {user.role}
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-md)",
              color: "var(--color-muted)",
              marginBottom: "var(--space-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
              }}
            >
              <FiMail /> {user.email}
            </div>
          </div>

          {editing && (
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-background)",
                  fontSize: "var(--font-size-base)",
                  outline: "none",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-border)")
                }
              />
            </div>
          )}
        </section>

        {/* Role Specific Details */}
        {user.role === "student" && (
          <section
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-lg)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiBookOpen /> Academic Details
            </h3>

            {editing ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "var(--space-md)",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    College / University
                  </label>
                  <input
                    type="text"
                    value={studentDetails.college}
                    onChange={(e) =>
                      setStudentDetails({
                        ...studentDetails,
                        college: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Branch / Major
                  </label>
                  <input
                    type="text"
                    value={studentDetails.branch}
                    onChange={(e) =>
                      setStudentDetails({
                        ...studentDetails,
                        branch: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={studentDetails.cgpa}
                    onChange={(e) =>
                      setStudentDetails({
                        ...studentDetails,
                        cgpa: parseFloat(e.target.value),
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={studentDetails.graduation_year}
                    onChange={(e) =>
                      setStudentDetails({
                        ...studentDetails,
                        graduation_year: parseInt(e.target.value),
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Skills & Proficiency
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {skillEntries.map((entry, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          value={entry.name}
                          onChange={(e) => {
                            const newEntries = [...skillEntries];
                            newEntries[idx] = {
                              ...entry,
                              name: e.target.value,
                            };
                            setSkillEntries(newEntries);
                          }}
                          placeholder="Skill name"
                          style={{
                            flex: "1 1 200px",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-border)",
                          }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={entry.proficiency}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || "0");
                            const newEntries = [...skillEntries];
                            newEntries[idx] = { ...entry, proficiency: val };
                            setSkillEntries(newEntries);
                          }}
                          style={{ width: 160 }}
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={entry.proficiency}
                          onChange={(e) => {
                            let val = parseInt(e.target.value || "0");
                            if (isNaN(val)) val = 0;
                            val = Math.max(0, Math.min(100, val));
                            const newEntries = [...skillEntries];
                            newEntries[idx] = { ...entry, proficiency: val };
                            setSkillEntries(newEntries);
                          }}
                          style={{
                            width: 64,
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-border)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSkillEntries(
                              skillEntries.filter((_, i) => i !== idx),
                            );
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--color-muted)",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setSkillEntries([
                            ...skillEntries,
                            { name: "", proficiency: 60 },
                          ])
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          background: "var(--color-surface)",
                        }}
                      >
                        Add skill
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Top Projects
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {projectEntries.map((project, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: 8,
                          padding: 12,
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-background)",
                        }}
                      >
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => {
                            const next = [...projectEntries];
                            next[idx] = { ...project, title: e.target.value };
                            setProjectEntries(next);
                          }}
                          placeholder="Project title"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface)",
                          }}
                        />
                        <textarea
                          rows={3}
                          value={project.desc}
                          onChange={(e) => {
                            const next = [...projectEntries];
                            next[idx] = { ...project, desc: e.target.value };
                            setProjectEntries(next);
                          }}
                          placeholder="Short description of what you built"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface)",
                            fontFamily: "inherit",
                            resize: "none",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setProjectEntries(
                                projectEntries.filter((_, i) => i !== idx),
                              );
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--color-muted)",
                              cursor: "pointer",
                              fontSize: "var(--font-size-sm)",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setProjectEntries([
                            ...projectEntries,
                            { title: "", desc: "" },
                          ])
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          background: "var(--color-surface)",
                        }}
                      >
                        Add project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "var(--space-lg)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    College
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {studentDetails.college || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Branch
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {studentDetails.branch || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    CGPA
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiAward color="var(--color-primary)" />{" "}
                    {studentDetails.cgpa || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Graduation Year
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {studentDetails.graduation_year || "-"}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Skills
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--space-lg)",
                    }}
                  >
                    {skillEntries?.length > 0 ? (
                      skillEntries.map((entry) => (
                        <div
                          key={entry.name}
                          style={{ minWidth: 200, flex: "1 1 200px" }}
                        >
                          <ProficiencyBar
                            label={entry.name}
                            value={entry.proficiency}
                            ariaLabel={`${entry.name} proficiency`}
                          />
                        </div>
                      ))
                    ) : (
                      <span
                        style={{
                          color: "var(--color-muted)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        No skills added
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Top Projects
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {projectEntries?.length > 0 ? (
                      projectEntries.map((project, idx) => (
                        <div
                          key={`${project.title}-${idx}`}
                          style={{
                            padding: 14,
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-background)",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            {project.title || "Untitled project"}
                          </div>
                          <div
                            style={{
                              color: "var(--color-muted)",
                              fontSize: "var(--font-size-sm)",
                              lineHeight: 1.6,
                            }}
                          >
                            {project.desc || "No description added"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span
                        style={{
                          color: "var(--color-muted)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        No projects added
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {user.role === "student" && <ResumeSection initialResume={resume} />}

        {user.role === "company" && (
          <section
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-lg)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiBriefcase /> Company Details
            </h3>

            {editing ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-md)",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyDetails.name}
                    onChange={(e) =>
                      setCompanyDetails({
                        ...companyDetails,
                        name: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Legal Name
                  </label>
                  <input
                    type="text"
                    value={companyDetails.legal_name || ""}
                    onChange={(e) =>
                      setCompanyDetails({
                        ...companyDetails,
                        legal_name: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Company Size
                  </label>
                  {!isCustomCompanySize ? (
                    <select
                      value={
                        isPredefinedCompanySize(companyDetails.size)
                          ? companyDetails.size
                          : ""
                      }
                      onChange={(e) => {
                        const nextSize = e.target.value;
                        if (nextSize === "Custom") {
                          setIsCustomCompanySize(true);
                          return;
                        }
                        setCompanyDetails({
                          ...companyDetails,
                          size: nextSize,
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background)",
                      }}
                    >
                      <option value="" disabled>
                        Select company size
                      </option>
                      {predefinedCompanySizes
                        .filter((sizeOption) => sizeOption !== "Custom")
                        .map((sizeOption) => (
                          <option key={sizeOption} value={sizeOption}>
                            {sizeOption}
                          </option>
                        ))}
                      <option value="Custom">Custom</option>
                    </select>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Enter custom size"
                        value={companyDetails.size || ""}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            size: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-background)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCompanySize(false);
                          setCompanyDetails({
                            ...companyDetails,
                            size: "",
                          });
                        }}
                        style={{
                          justifySelf: "start",
                          padding: "8px 12px",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-background)",
                          cursor: "pointer",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        Choose a preset size
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Primary Contact
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      value={companyDetails.primary_contact?.name || ""}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          primary_contact: {
                            ...(companyDetails.primary_contact || {}),
                            name: e.target.value,
                          },
                        })
                      }
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background)",
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={companyDetails.primary_contact?.email || ""}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          primary_contact: {
                            ...(companyDetails.primary_contact || {}),
                            email: e.target.value,
                          },
                        })
                      }
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={companyDetails.primary_contact?.phone || ""}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          primary_contact: {
                            ...(companyDetails.primary_contact || {}),
                            phone: e.target.value,
                          },
                        })
                      }
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={companyDetails.primary_contact?.title || ""}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          primary_contact: {
                            ...(companyDetails.primary_contact || {}),
                            title: e.target.value,
                          },
                        })
                      }
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background)",
                      }}
                    />
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={companyDetails.description}
                    onChange={(e) =>
                      setCompanyDetails({
                        ...companyDetails,
                        description: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Industry
                  </label>
                  {!isCustomIndustry ? (
                    <select
                      value={
                        isPredefinedIndustry(companyDetails.industry)
                          ? companyDetails.industry
                          : ""
                      }
                      onChange={(e) => {
                        const nextIndustry = e.target.value;
                        if (nextIndustry === "Custom") {
                          setIsCustomIndustry(true);
                          return;
                        }
                        setCompanyDetails({
                          ...companyDetails,
                          industry: nextIndustry,
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background)",
                      }}
                    >
                      <option value="" disabled>
                        Select industry
                      </option>
                      {industryOptions.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                      <option value="Custom">Custom</option>
                    </select>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Enter custom industry"
                        value={companyDetails.industry}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            industry: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-background)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomIndustry(false);
                          setCompanyDetails({
                            ...companyDetails,
                            industry: "",
                          });
                        }}
                        style={{
                          justifySelf: "start",
                          padding: "8px 12px",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-background)",
                          cursor: "pointer",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        Choose a preset industry
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    value={companyDetails.location}
                    onChange={(e) =>
                      setCompanyDetails({
                        ...companyDetails,
                        location: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Website
                  </label>
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <span
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius) 0 0 var(--radius)",
                        border: "1px solid var(--color-border)",
                        borderRight: 0,
                        background: "var(--color-surface)",
                        color: "var(--color-muted)",
                        fontWeight: 600,
                      }}
                    >
                      https://
                    </span>
                    <input
                      type="text"
                      value={stripHttpsPrefix(companyDetails.website)}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          website: stripHttpsPrefix(e.target.value),
                        })
                      }
                      onBlur={() =>
                        setCompanyDetails((prev) => ({
                          ...prev,
                          website: stripHttpsPrefix(prev.website),
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "0 var(--radius) var(--radius) 0",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "var(--space-lg)",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    About
                  </div>
                  <div style={{ fontWeight: 500, lineHeight: 1.6 }}>
                    {companyDetails.description || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Industry
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {companyDetails.industry || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Location
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FiMapPin color="var(--color-error)" />{" "}
                    {companyDetails.location || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Legal Name
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {companyDetails.legal_name || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Company Size
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {companyDetails.size || "-"}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Primary Contact
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {companyDetails.primary_contact?.name || "-"}{" "}
                    {companyDetails.primary_contact?.email
                      ? `· ${companyDetails.primary_contact.email}`
                      : ""}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Website
                  </div>
                  {companyDetails.website ? (
                    <a
                      href={companyDetails.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--color-primary)",
                      }}
                    >
                      <FiLink /> {companyDetails.website}
                    </a>
                  ) : (
                    <span
                      style={{
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--color-muted)",
                      }}
                    >
                      <FiLink /> No website added
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {editing && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "calc(var(--space-xl) * -0.25)",
            }}
          >
            <Button variant="primary" onClick={handleSave} loading={saving}>
              <FiSave /> Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
