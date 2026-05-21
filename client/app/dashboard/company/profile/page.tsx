"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getJson, putJson } from "../../../../lib/api";

interface CompanyProfileForm {
  legal_name: string;
  company_name: string;
  industry: string;
  size: string;
  website: string;
  primary_contact: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
  description: string;
  address: string;
}

const ensureHttpsPrefix = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const stripHttpsPrefix = (value: string) => value.replace(/^https?:\/\//i, "");

export default function CompanyProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [form, setForm] = useState<CompanyProfileForm>({
    legal_name: "",
    company_name: "",
    industry: "",
    size: "",
    website: "",
    primary_contact: { name: "", email: "", phone: "", title: "" },
    description: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const isPredefinedIndustry = (industry?: string) =>
    Boolean(industry && industryOptions.includes(industry));

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && user.role !== "company")
      router.push("/dashboard");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "company") return;

    const load = async () => {
      setLoading(true);
      const [res, industriesRes] = await Promise.all([
        getJson<{ success: boolean; data: CompanyProfileForm }>(
          "/companies/me",
        ),
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
        const data = res.body.data;
        const nextIndustry = data.industry || "";
        setIsCustomIndustry(
          nextIndustry !== "" && !nextIndustryOptions.includes(nextIndustry),
        );
        setForm({
          legal_name: data.legal_name || "",
          company_name: data.company_name || "",
          industry: nextIndustry,
          size: data.size || "",
          website: stripHttpsPrefix(data.website || ""),
          primary_contact: {
            name: data.primary_contact?.name || "",
            email: data.primary_contact?.email || "",
            phone: data.primary_contact?.phone || "",
            title: data.primary_contact?.title || "",
          },
          description: data.description || "",
          address: data.address || "",
        });
      }
      setLoading(false);
    };

    load();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const res = await putJson<{ success: boolean }>("/companies/me", {
      ...form,
      website: ensureHttpsPrefix(form.website),
    });
    setSaving(false);

    if (res.ok) {
      setSuccess("Profile updated.");
      setTimeout(() => router.push("/dashboard/company"), 600);
      return;
    }

    setError("Unable to save profile.");
  }

  if (loading || isLoading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Complete company profile
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Add the required details to unlock approvals, postings, and recruiter
          tools.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "24px",
          border: "1px solid rgba(148,174,254,0.25)",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          display: "grid",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Legal Name</label>
          <input
            value={form.legal_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, legal_name: e.target.value }))
            }
            required
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Display Company Name</label>
          <input
            value={form.company_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, company_name: e.target.value }))
            }
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Industry</label>
          {!isCustomIndustry ? (
            <select
              value={isPredefinedIndustry(form.industry) ? form.industry : ""}
              onChange={(e) => {
                const nextIndustry = e.target.value;
                if (nextIndustry === "Custom") {
                  setIsCustomIndustry(true);
                  return;
                }
                setForm((prev) => ({ ...prev, industry: nextIndustry }));
              }}
              required
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
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
                value={form.industry}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, industry: e.target.value }))
                }
                required
                placeholder="Enter custom industry"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomIndustry(false);
                  setForm((prev) => ({ ...prev, industry: "" }));
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  alignSelf: "start",
                  cursor: "pointer",
                }}
              >
                Choose a preset industry
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Company Size</label>
          <input
            value={form.size}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, size: e.target.value }))
            }
            required
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Website</label>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <span
              style={{
                padding: "12px 14px",
                borderRadius: "10px 0 0 10px",
                border: "1px solid #e2e8f0",
                borderRight: 0,
                background: "#f8fafc",
                color: "#475569",
                fontWeight: 600,
              }}
            >
              https://
            </span>
            <input
              type="text"
              value={stripHttpsPrefix(form.website)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  website: stripHttpsPrefix(e.target.value),
                }))
              }
              onBlur={() =>
                setForm((prev) => ({
                  ...prev,
                  website: stripHttpsPrefix(prev.website),
                }))
              }
              required
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "0 10px 10px 0",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Primary Contact Name</label>
          <input
            value={form.primary_contact.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                primary_contact: {
                  ...prev.primary_contact,
                  name: e.target.value,
                },
              }))
            }
            required
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Primary Contact Email</label>
          <input
            type="email"
            value={form.primary_contact.email}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                primary_contact: {
                  ...prev.primary_contact,
                  email: e.target.value,
                },
              }))
            }
            required
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Primary Contact Phone</label>
          <input
            value={form.primary_contact.phone}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                primary_contact: {
                  ...prev.primary_contact,
                  phone: e.target.value,
                },
              }))
            }
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Primary Contact Title</label>
          <input
            value={form.primary_contact.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                primary_contact: {
                  ...prev.primary_contact,
                  title: e.target.value,
                },
              }))
            }
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Company Address</label>
          <textarea
            value={form.address || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, address: e.target.value }))
            }
            rows={2}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Company Description</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              resize: "none",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              color: "#b91c1c",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(34,197,94,0.08)",
              color: "#15803d",
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #2297FA 0%, #8082D6 100%)",
              color: "#fff",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
