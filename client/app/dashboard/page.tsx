"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiChevronRight,
  FiBell,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import { getJson } from "../../lib/api";

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  student: { label: "Student", color: "#2297FA", bg: "rgba(34,151,250,0.1)" },
  company: { label: "Company", color: "#8082D6", bg: "rgba(128,130,214,0.1)" },
  admin: { label: "Admin", color: "#50B6FE", bg: "rgba(80,182,254,0.1)" },
  coordinator: {
    label: "Coordinator",
    color: "#94AEFE",
    bg: "rgba(148,174,254,0.1)",
  },
  interviewer: {
    label: "Interviewer",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
};

type AppStat = {
  totalApplications: number;
  activeInterviews: number;
  offersReceived: number;
  savedInternships: number;
};

type RecentApplication = {
  id: string;
  role: string;
  company: string;
  status: string;
  date: string;
  logo: string;
};

type RecommendedInternship = {
  id: string;
  role: string;
  company: string;
  location: string;
  stipend: string;
};

type ProfileStudent = {
  college?: string;
  branch?: string;
  cgpa?: number;
  graduation_year?: number;
  skills?: string[];
  projects?: Array<{ title?: string; desc?: string }>;
};

type ProfileSummary = {
  name?: string;
  avatar?: string;
  student?: ProfileStudent;
};

const companyLinks = [
  {
    label: "Post Internship",
    icon: "➕",
    desc: "Create a new internship listing",
    href: "/dashboard/company/post",
  },
  {
    label: "Offer Letters",
    icon: "✉️",
    desc: "Generate and send offer letters",
    href: "/dashboard/company/offer-letters",
  },
  {
    label: "Contracts",
    icon: "✍️",
    desc: "Generate and manage contracts",
    href: "/dashboard/contracts",
  },
  {
    label: "Applicants",
    icon: "👥",
    desc: "Review student applications",
    href: "/dashboard/company/applicants",
  },
  {
    label: "Schedule Interviews",
    icon: "📅",
    desc: "Schedule interviews with candidates",
    href: "/dashboard/company/interviews/schedule",
  },
];

const coordinatorLinks = [
  {
    label: "Verification",
    icon: "✅",
    desc: "Verify student uploaded documents",
    href: "/dashboard/coordinator/verification",
  },
  {
    label: "Bulk Export",
    icon: "📦",
    desc: "Export documents as ZIP archives",
    href: "/dashboard/coordinator/export",
  },
  {
    label: "Manage Users",
    icon: "🧑‍💻",
    desc: "Manage students and companies",
    href: "/dashboard/coordinator/users",
  },
  {
    label: "System Reports",
    icon: "📊",
    desc: "View portal usage statistics",
    href: "/dashboard/coordinator/reports",
  },
  {
    label: "Global Interviews",
    icon: "📅",
    desc: "Monitor all interview activities",
    href: "/dashboard/coordinator/interviews",
  },
];

const interviewerLinks = [
  {
    label: "Provide Feedback",
    icon: "📝",
    desc: "Evaluate candidates after interviews",
    href: "/dashboard/interviewer/feedback",
  },
];

type DashboardLink = {
  label: string;
  icon: string;
  desc: string;
  href: string;
};

const studentLinks: DashboardLink[] = [
  {
    label: "Browse Internships",
    icon: "🔎",
    desc: "Explore internship opportunities",
    href: "/apply",
  },
  {
    label: "My Documents",
    icon: "📄",
    desc: "Upload and manage required documents",
    href: "/dashboard/student/documents",
  },
  {
    label: "My Interviews",
    icon: "📅",
    desc: "Track invitations and interview history",
    href: "/dashboard/student/interviews",
  },
  {
    label: "Edit Profile",
    icon: "👤",
    desc: "Update your student profile details",
    href: "/profile",
  },
];

const roleLinks: Record<string, DashboardLink[]> = {
  student: studentLinks,
  company: companyLinks,
  coordinator: coordinatorLinks,
  admin: coordinatorLinks,
  interviewer: interviewerLinks,
};

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [stats, setStats] = useState<AppStat>({
    totalApplications: 0,
    activeInterviews: 0,
    offersReceived: 0,
    savedInternships: 0,
  });
  const [recentApplications, setRecentApplications] = useState<
    RecentApplication[]
  >([]);
  const [recommendedInternships, setRecommendedInternships] = useState<
    RecommendedInternship[]
  >([]);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user?.role === "company") {
      router.push("/dashboard/company");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role !== "company") {
      const fetchDashboardData = async () => {
        try {
          const [dashboardRes, profileRes] = await Promise.all([
            getJson<{
              success: boolean;
              data: {
                stats: AppStat;
                recentApplications: RecentApplication[];
                recommendedInternships: RecommendedInternship[];
              };
            }>("/student-dashboard"),
            getJson<{ success: boolean; data: ProfileSummary }>("/profile"),
          ]);

          if (dashboardRes.ok && dashboardRes.body?.success) {
            setStats(dashboardRes.body.data.stats);
            setRecentApplications(dashboardRes.body.data.recentApplications);
            setRecommendedInternships(
              dashboardRes.body.data.recommendedInternships,
            );
          }

          if (profileRes.ok && profileRes.body?.success) {
            const { name, avatar, student } = profileRes.body.data || {};
            const hasBasicInfo = Boolean(name?.trim());
            const hasStudentDetails =
              Boolean(student?.college?.trim()) &&
              Boolean(student?.branch?.trim()) &&
              typeof student?.cgpa === "number" &&
              student.cgpa > 0 &&
              typeof student?.graduation_year === "number" &&
              student.graduation_year > 0 &&
              Array.isArray(student?.skills) &&
              student.skills.length > 0 &&
              Array.isArray(student?.projects) &&
              student.projects.length > 0 &&
              student.projects.every(
                (project) =>
                  Boolean(project?.title?.trim()) &&
                  Boolean(project?.desc?.trim()),
              );

            setProfileComplete(hasBasicInfo && hasStudentDetails);
          } else {
            setProfileComplete(false);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoadingData(false);
        }
      };

      fetchDashboardData();
    }
  }, [user]);

  if (
    authLoading ||
    loadingData ||
    !user ||
    user.role === "company" ||
    !mounted
  ) {
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

  const meta = roleMeta[user.role] ?? roleMeta.student;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Interview":
        return { color: "#8082D6", bg: "rgba(128,130,214,0.1)" };
      case "In Review":
        return { color: "#2297FA", bg: "rgba(34,151,250,0.1)" };
      case "Pending":
        return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
      case "Rejected":
        return { color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
      case "Offer":
        return { color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
      default:
        return { color: "var(--color-muted)", bg: "var(--color-border)" };
    }
  };

  const statCards = [
    {
      label: "Total Applications",
      value: stats.totalApplications,
      icon: <FiBriefcase size={24} />,
      color: "#2297FA",
      bg: "rgba(34,151,250,0.12)",
    },
    {
      label: "Active Interviews",
      value: stats.activeInterviews,
      icon: <FiClock size={24} />,
      color: "#8082D6",
      bg: "rgba(128,130,214,0.12)",
    },
    {
      label: "Offers Received",
      value: stats.offersReceived,
      icon: <FiCheckCircle size={24} />,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.12)",
    },
    {
      label: "Saved Internships",
      value: stats.savedInternships,
      icon: <FiStar size={24} />,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
    },
  ];

  return (
    <div
      className="animate-fade-in-up"
      style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "var(--space-xl) var(--space-lg)",
      }}
    >
      {/* Header Section */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-md)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              background: meta.bg,
              border: `1px solid ${meta.color}30`,
              marginBottom: "var(--space-sm)",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: 700,
                color: meta.color,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {meta.label}
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "var(--space-xs)",
            }}
          >
            Welcome back, {user.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p
            style={{
              color: "var(--color-muted)",
              fontSize: "var(--font-size-base)",
              fontWeight: 500,
            }}
          >
            Here&apos;s an overview of your internship journey.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            alignItems: "center",
          }}
        >
          <button
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-foreground)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <FiBell size={20} />
          </button>
          <Button variant="ghost" onClick={logout} id="dashboard-logout">
            Sign out
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        {statCards.map((s, i) => (
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
              transition:
                "transform var(--transition-base), box-shadow var(--transition-base)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
              e.currentTarget.style.borderColor = "var(--color-primary-20)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-lg)",
                background: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-muted)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {s.label}
              </p>
              <h3
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </h3>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "var(--space-xl)",
          alignItems: "start",
        }}
      >
        {/* Left Column: Recent Applications */}
        <section
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
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
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
              Recent Applications
            </h2>
            <Button
              variant="ghost"
              size="sm"
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              View All <FiChevronRight />
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentApplications.length > 0 ? (
              recentApplications.map((app, index) => {
                const statusStyle = getStatusColor(app.status);
                return (
                  <div
                    key={app.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--space-lg)",
                      borderBottom:
                        index < recentApplications.length - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                      transition: "background var(--transition-fast)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-background)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-md)",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "var(--radius-sm)",
                          background: "var(--gradient-brand)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.25rem",
                          fontWeight: 800,
                        }}
                      >
                        {app.logo}
                      </div>
                      <div>
                        <h4
                          style={{
                            fontWeight: 600,
                            fontSize: "var(--font-size-base)",
                            marginBottom: 2,
                          }}
                        >
                          {app.role}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-sm)",
                            fontSize: "var(--font-size-sm)",
                            color: "var(--color-muted)",
                          }}
                        >
                          <span>{app.company}</span>
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "var(--color-subtle)",
                            }}
                          />
                          <span>{app.date}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {app.status}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: "var(--space-xl)",
                  textAlign: "center",
                  color: "var(--color-muted)",
                }}
              >
                You haven&apos;t applied to any internships yet.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Recommendations */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
          }}
        >
          {/* Card: Recommendations */}
          <div
            style={{
              background: "var(--gradient-card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--color-primary-20)",
              padding: "var(--space-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-md)",
              }}
            >
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
                Recommended for You
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
              }}
            >
              {recommendedInternships.length > 0 ? (
                recommendedInternships.map((internship) => (
                  <div
                    key={internship.id}
                    style={{
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-md)",
                      border: "1px solid var(--color-border)",
                      transition: "all var(--transition-base)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.borderColor =
                        "var(--color-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: 700,
                        fontSize: "var(--font-size-base)",
                        marginBottom: 4,
                      }}
                    >
                      {internship.role}
                    </h4>
                    <div
                      style={{
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-muted)",
                        marginBottom: 8,
                      }}
                    >
                      {internship.company}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-md)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-muted)",
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FiMapPin /> {internship.location}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FiCalendar /> {internship.stipend}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-muted)",
                    textAlign: "center",
                    padding: "var(--space-md) 0",
                  }}
                >
                  No recommendations available at the moment.
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              style={{ width: "100%", marginTop: "var(--space-md)" }}
              onClick={() => router.push("/explore")}
            >
              Explore More
            </Button>
          </div>

          {/* Action Card */}
          {!profileComplete && (
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
                padding: "var(--space-xl)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--color-primary-10)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-md)",
                }}
              >
                <FiBriefcase size={28} />
              </div>
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 700,
                  marginBottom: "var(--space-sm)",
                }}
              >
                Complete your profile
              </h3>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-muted)",
                  marginBottom: "var(--space-lg)",
                }}
              >
                Increase your chances of getting hired by adding more details to
                your resume and portfolio.
              </p>
              <Button
                variant="primary"
                style={{ width: "100%" }}
                onClick={() => router.push("/profile")}
              >
                Edit Profile
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
