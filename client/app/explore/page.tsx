"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiFilter,
  FiDollarSign,
} from "react-icons/fi";

const mockInternships = [
  {
    id: "1",
    role: "Frontend Engineering Intern",
    company: "TechCorp Solutions",
    location: "Remote",
    stipend: "₹20,000/mo",
    type: "Full-time",
    duration: "3 months",
    tags: ["React", "TypeScript", "Next.js"],
    logo: "T",
    color: "#2297FA",
    bg: "rgba(34,151,250,0.1)",
  },
  {
    id: "2",
    role: "Product Design Intern",
    company: "Creative Studio",
    location: "Bangalore, India",
    stipend: "₹25,000/mo",
    type: "Part-time",
    duration: "6 months",
    tags: ["Figma", "UI/UX", "Prototyping"],
    logo: "C",
    color: "#8082D6",
    bg: "rgba(128,130,214,0.1)",
  },
  {
    id: "3",
    role: "Data Science Intern",
    company: "Analytics Hub",
    location: "Hyderabad, India",
    stipend: "₹30,000/mo",
    type: "Full-time",
    duration: "6 months",
    tags: ["Python", "Machine Learning", "SQL"],
    logo: "A",
    color: "#50B6FE",
    bg: "rgba(80,182,254,0.1)",
  },
  {
    id: "4",
    role: "Backend Engineering Intern",
    company: "Cloud Systems",
    location: "Remote",
    stipend: "₹22,000/mo",
    type: "Full-time",
    duration: "4 months",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    logo: "C",
    color: "#94AEFE",
    bg: "rgba(148,174,254,0.1)",
  },
  {
    id: "5",
    role: "Marketing Intern",
    company: "Growth Partners",
    location: "Mumbai, India",
    stipend: "₹15,000/mo",
    type: "Full-time",
    duration: "3 months",
    tags: ["SEO", "Content", "Social Media"],
    logo: "G",
    color: "#7ED8FA",
    bg: "rgba(126,216,250,0.1)",
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredInternships = mockInternships.filter(
    (internship) =>
      internship.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      {/* Header section */}
      <section
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "var(--space-2xl) var(--space-lg)",
        }}
      >
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-md)",
            }}
          >
            Explore Internships
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-lg)",
              color: "var(--color-muted)",
              maxWidth: 600,
              marginBottom: "var(--space-xl)",
            }}
          >
            Discover opportunities that match your skills and career goals.
            Apply with a single click and track your applications seamlessly.
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--space-sm)",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: "1 1 300px",
                maxWidth: 600,
              }}
            >
              <FiSearch
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search by role, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-background)",
                  fontSize: "var(--font-size-base)",
                  outline: "none",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-primary)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </div>
            <Button
              variant="secondary"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <FiFilter /> Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: "var(--space-2xl) var(--space-lg)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          <div
            style={{
              marginBottom: "var(--space-lg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700 }}>
              {filteredInternships.length} opportunities found
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "var(--space-lg)",
            }}
          >
            {filteredInternships.map((internship) => (
              <div
                key={internship.id}
                className="animate-fade-in-up"
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--color-border)",
                  padding: "var(--space-xl)",
                  transition:
                    "transform var(--transition-base), box-shadow var(--transition-base)",
                  display: "flex",
                  flexDirection: "column",
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
                    display: "flex",
                    gap: "var(--space-md)",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "var(--radius-lg)",
                      background: internship.bg,
                      color: internship.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {internship.logo}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: 700,
                        marginBottom: 4,
                        lineHeight: 1.2,
                      }}
                    >
                      {internship.role}
                    </h3>
                    <div
                      style={{
                        color: "var(--color-muted)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: 500,
                      }}
                    >
                      {internship.company}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-sm)",
                    marginBottom: "var(--space-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-subtle)",
                      background: "var(--color-background)",
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    <FiMapPin /> {internship.location}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-subtle)",
                      background: "var(--color-background)",
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    <FiDollarSign /> {internship.stipend}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-subtle)",
                      background: "var(--color-background)",
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    <FiBriefcase /> {internship.type}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: "var(--space-xl)",
                    flex: 1,
                  }}
                >
                  {internship.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        color: "var(--color-foreground)",
                        background: "var(--color-border)",
                        padding: "4px 10px",
                        borderRadius: 6,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <Button
                    variant="primary"
                    style={{ flex: 1 }}
                    onClick={() =>
                      router.push("/dashboard/student/applications/apply")
                    }
                  >
                    Apply Now
                  </Button>
                  <Button variant="secondary">Details</Button>
                </div>
              </div>
            ))}
          </div>

          {filteredInternships.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-3xl) 0",
                color: "var(--color-muted)",
              }}
            >
              <FiSearch
                size={48}
                style={{ opacity: 0.2, marginBottom: "var(--space-md)" }}
              />
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                No internships found
              </h3>
              <p>Try adjusting your search query or filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
