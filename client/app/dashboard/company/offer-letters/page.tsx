"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { getJson, postAuthJson, resolveBaseUrl, downloadBlob } from "../../../../lib/api";

const templates = [
  { id: "t1", name: "Standard Software Engineering Intern" },
  { id: "t2", name: "Data Science Intern (Stipend)" },
  { id: "t3", name: "Business Analyst Intern (Unpaid)" },
];

interface Application {
  _id: string;
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roleTitle: string;
  internshipId: string;
  status: string;
  appliedAt: string;
  studentAddress?: string;
  studentPhone?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function OfferLetterGenerator() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);

  // Calculate default expiration date (30 days from now)
  const defaultExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [customFields, setCustomFields] = useState({
    companyName: user?.name || "Tech Innovators Inc.",
    hrContact: "Alice Johnson, HR Manager",
    expirationDate: defaultExpirationDate,
    salary: "5000",
    duration: "12",
    location: "Remote",
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    responsibilities:
      "Develop software features\nCollaborate with team\nParticipate in code reviews",
    benefits:
      "Health insurance\nFlexible working hours\nLearning opportunities",
    companyPhone: "",
    companyEmail: "",
    companyAddress: "",
  });

  const [signatureType, setSignatureType] = useState<'upload'>('upload');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedOfferId, setGeneratedOfferId] = useState<string | null>(null);
  const [creatingTestData, setCreatingTestData] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      const res = await getJson<ApiResponse<Application[]>>(
        "/companies/me/applications",
      );
      if (res.ok && res.body?.success && res.body.data) {
        const normalizedApps = res.body.data.map((app: any) => ({
          ...app,
          _id: app._id || app.id,
        }));
        const selectedApps = normalizedApps.filter(
          (app) => app.status === "selected",
        );
        const appsToShow =
          selectedApps.length > 0 ? selectedApps : normalizedApps;
        setApplications(appsToShow);
        if (appsToShow.length > 0) {
          setSelectedApplication(appsToShow[0]._id);
        }
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size should be less than 2MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSignatureImage(event.target.result as string);
        setSignatureType('upload');
      }
    };
    reader.onerror = () => {
      setUploadError('Error reading signature image file.');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    async function loadCompanyProfile() {
      try {
        const res = await getJson<ApiResponse>("/companies/me");
        if (res.ok && res.body?.success && res.body.data) {
          const profile = res.body.data;
          setCustomFields((prev) => ({
            ...prev,
            companyName:
              profile.company_name || profile.legal_name || prev.companyName,
            hrContact: profile.primary_contact?.name
              ? `${profile.primary_contact.name}${profile.primary_contact.title ? `, ${profile.primary_contact.title}` : ""}`
              : prev.hrContact,
            companyPhone: profile.primary_contact?.phone || "",
            companyEmail: profile.primary_contact?.email || "",
            companyAddress: profile.address || "",
          }));
        }
      } catch (error) {
        console.error("Failed to load company profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (user && user.role === "company") {
      loadCompanyProfile();
      loadApplications();
    } else {
      setLoadingProfile(false);
      setLoadingApplications(false);
    }
  }, [user, loadApplications]);

  const handleGeneratePDF = async () => {
    if (!selectedApplication) {
      setErrorMsg("Please select a candidate");
      return;
    }

    setGenerating(true);
    setSuccessMsg("");
    setErrorMsg("");
    setGeneratedOfferId(null);

    try {
      // First, generate the offer letter
      const generateRes = await postAuthJson<ApiResponse>(
        "/offer-letters/generate",
        {
          applicationId: selectedApplication,
          // Backend expects a Mongo ObjectId template; local UI templates are preview-only.
          templateId: null,
          customDetails: {
            salary: customFields.salary,
            duration: customFields.duration,
            location: customFields.location,
            start_date: customFields.startDate,
            responsibilities: customFields.responsibilities
              .split("\n")
              .filter((r) => r.trim()),
            benefits: customFields.benefits.split("\n").filter((b) => b.trim()),
          },
        },
      );

      if (!generateRes.ok || !generateRes.body?.success) {
        throw new Error(
          generateRes.body?.message || "Failed to generate offer letter",
        );
      }

      const offerId = generateRes.body.data._id;
      setGeneratedOfferId(offerId);

      // Then, generate the PDF
      const pdfRes = await postAuthJson<ApiResponse>(
        `/offer-letters/${offerId}/generate-pdf`,
        {
          signatureType,
          signatureImage,
          hrContact: customFields.hrContact,
          expirationDate: customFields.expirationDate,
          companyName: customFields.companyName,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        },
      );

      if (!pdfRes.ok || !pdfRes.body?.success) {
        const msg =
          pdfRes.body && typeof pdfRes.body === "object" && "message" in pdfRes.body
            ? String((pdfRes.body as any).message)
            : "Failed to generate PDF";
        throw new Error(msg);
      }

      setSuccessMsg(
        'Offer Letter PDF generated successfully! Click "Send to Student" to email it.',
      );

      // Auto-download the PDF using the proper API function
      const blob = await downloadBlob(`/offer-letters/${offerId}/download`);
      if (!blob) {
        throw new Error("Failed to download PDF");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const candidateFileName = student.name ? student.name.replace(/\s+/g, "_") : "Candidate";
      a.download = `${candidateFileName}_Offer_Letter.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Generate PDF error:", error);
      setErrorMsg(error.message || "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateTestData = async () => {
    setCreatingTestData(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await postAuthJson<ApiResponse>(
        "/create-test-data-for-me",
        {},
      );
      if (res.ok && res.body?.success) {
        setSuccessMsg(
          "Test data created successfully! Refreshing applications...",
        );
        // Reload applications
        loadApplications();
      } else {
        throw new Error(res.body?.message || "Failed to create test data");
      }
    } catch (error: any) {
      console.error("Create test data error:", error);
      setErrorMsg(error.message || "Failed to create test data");
    } finally {
      setCreatingTestData(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedOfferId) {
      setErrorMsg("Please generate the PDF first");
      return;
    }

    setGenerating(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await postAuthJson<ApiResponse>(
        `/offer-letters/${generatedOfferId}/send`,
        {},
      );

      if (res.ok && res.body?.success) {
        setSuccessMsg("Offer letter sent to student successfully!");
      } else {
        throw new Error(res.body?.message || "Failed to send offer letter");
      }
    } catch (error: any) {
      console.error("Send email error:", error);
      setErrorMsg(error.message || "Failed to send offer letter");
    } finally {
      setGenerating(false);
    }
  };

  const selectedApp = applications.find(
    (app) => app._id === selectedApplication,
  );

  const student = {
    name: selectedApp?.studentName || "Hannah Morales",
    role: selectedApp?.roleTitle || "Marketing Specialist",
    startDate: customFields.startDate || "March 15, 2026",
    stipend: customFields.salary ? `₹${customFields.salary}/mo` : "Competitive package",
  };

  return (
    <div
      style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "var(--space-xl) var(--space-lg)",
      }}
    >
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h1
          style={{
            fontSize: "var(--font-size-3xl)",
            marginBottom: "var(--space-xs)",
          }}
        >
          Offer Letter Generator
        </h1>
        <p style={{ color: "var(--color-muted)" }}>
          Create, customize, and send offer letters to selected candidates.
        </p>
      </div>

      {loadingApplications ? (
        <div style={{ textAlign: "center", padding: "var(--space-xl)" }}>
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div
          style={{
            padding: "var(--space-xl)",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--color-muted)" }}>
            No applications found. Please wait for candidates to apply to your internships.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-xl)",
            alignItems: "start",
          }}
        >
          {/* Controls Column */}
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
                padding: "var(--space-xl)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Configuration</span>
                {loadingProfile && (
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-muted)",
                      fontWeight: "normal",
                    }}
                  >
                    ⏳ Loading profile...
                  </span>
                )}
              </h2>

              <div style={{ marginBottom: "var(--space-md)" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Select Candidate
                </label>
                <select
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    fontSize: "var(--font-size-base)",
                    outline: "none",
                  }}
                >
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.studentName} - {app.roleTitle} ({app.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "var(--space-md)" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    fontSize: "var(--font-size-base)",
                    outline: "none",
                  }}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Offer Expiration Date</label>
                <input 
                  type="date" 
                  value={customFields.expirationDate} 
                  onChange={e => setCustomFields(prev => ({ ...prev, expirationDate: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                />
              </div>

              {/* Signature Block */}
              <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px dashed var(--color-border)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Company Signature Image</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    border: '2px dashed #86EFAC',
                    borderRadius: 'var(--radius-sm)',
                    background: '#F9FAFB',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
                  >
                    <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📤</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-foreground)' }}>
                      Upload signature image
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                      PNG or JPG (Max 2MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  
                  {uploadError && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: '#EF4444', marginTop: '4px' }}>
                      ⚠️ {uploadError}
                    </span>
                  )}

                  {signatureImage && (
                    <div style={{
                      marginTop: 'var(--space-xs)',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={signatureImage}
                          alt="Uploaded Signature"
                          style={{ maxHeight: '36px', maxWidth: '80px', objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                          File loaded
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSignatureImage(null);
                          setSignatureType('upload');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Unified Preview Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>Document Preview</h2>
                <span style={{ fontSize: 'var(--font-size-xs)', padding: '4px 10px', background: 'var(--color-primary-10)', color: 'var(--color-primary)', borderRadius: '99px', fontWeight: 600 }}>Live Edit</span>
              </div>
              
              {/* Elegant physical letter mockup sheet */}
              <div style={{
                background: 'white',
                position: 'relative',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
                padding: '40px var(--space-xl)',
                overflow: 'hidden',
                minHeight: '680px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: 'sans-serif',
                color: '#334155'
              }}>
                {/* Side mint green borders */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px', background: '#DCFCE7', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '8px', background: '#DCFCE7', pointerEvents: 'none' }} />

                {/* Geometric top-right corner triangles */}
                <svg style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', pointerEvents: 'none' }}>
                  <polygon points="120,110 8,0 120,0" fill="#0A5C36" />
                  <polygon points="120,80 38,0 120,0" fill="#15803D" />
                  <polygon points="120,50 70,0 120,0" fill="#22C55E" />
                  <polygon points="120,30 90,0 120,0" fill="#4ADE80" />
                </svg>

                {/* Geometric bottom-left corner triangles */}
                <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', height: '120px', pointerEvents: 'none' }}>
                  <polygon points="0,90 110,120 0,120" fill="#0A5C36" />
                  <polygon points="0,55 75,120 0,120" fill="#15803D" />
                  <polygon points="0,25 45,120 0,120" fill="#22C55E" />
                  <polygon points="0,5 25,120 0,120" fill="#4ADE80" />
                </svg>

                <div>
                  {/* Header Logo and Company Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10, position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '36px' }}>
                      <div style={{ width: '6px', height: '20px', background: '#15803D', borderRadius: '1px' }}></div>
                      <div style={{ width: '6px', height: '26px', background: '#15803D', borderRadius: '1px' }}></div>
                      <div style={{ width: '6px', height: '32px', background: '#15803D', borderRadius: '1px' }}></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0A5C36', letterSpacing: '0.5px' }}>
                        {customFields.companyName.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '9px', color: '#22C55E', fontWeight: 500 }}>
                        www.reallygreatsite.com
                      </span>
                    </div>
                  </div>

                  {/* JOB OFFER LETTER Shadowed Box Banner */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 20px 0', position: 'relative', zIndex: 10 }}>
                    <div style={{
                      background: '#DCFCE7',
                      border: '1px solid #86EFAC',
                      borderRadius: '6px',
                      padding: '8px 30px',
                      boxShadow: '3px 3px 0px rgba(10, 92, 54, 0.08)',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0A5C36', letterSpacing: '1px' }}>
                        JOB OFFER LETTER
                      </h3>
                    </div>
                  </div>

                  {/* To and Date block */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10, position: 'relative', fontSize: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>To:</span>
                      <span style={{ fontWeight: 'bold', color: '#0F172A', fontSize: '13px' }}>{student.name}</span>
                      <span style={{ color: '#64748B' }}>{selectedApp?.studentAddress || "123 Anywhere St., Any City ST 1234"}</span>
                    </div>
                    <div style={{ textAlign: 'right', color: '#64748B' }}>
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Salutation */}
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1E293B', marginBottom: '10px', zIndex: 10, position: 'relative' }}>
                    Dear {student.name},
                  </div>

                  {/* Letter Body Paragraph 1 */}
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, marginBottom: '16px', zIndex: 10, position: 'relative' }}>
                    We are pleased to offer you the position of <strong style={{ color: '#0F172A' }}>{student.role}</strong> at <strong style={{ color: '#0F172A' }}>{customFields.companyName}</strong>. Your skills and experience will be a valuable addition to our team.
                  </div>

                  {/* Offer Details */}
                  <div style={{ marginBottom: '16px', zIndex: 10, position: 'relative' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1E293B', marginBottom: '8px' }}>
                      Details of the Offer:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#15803D', fontWeight: 'bold' }}>•</span>
                        <span style={{ color: '#475569' }}><strong style={{ color: '#334155' }}>Position:</strong> {student.role}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#15803D', fontWeight: 'bold' }}>•</span>
                        <span style={{ color: '#475569' }}><strong style={{ color: '#334155' }}>Start Date:</strong> {student.startDate}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#15803D', fontWeight: 'bold' }}>•</span>
                        <span style={{ color: '#475569' }}><strong style={{ color: '#334155' }}>Work Location:</strong> Main Office</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#15803D', fontWeight: 'bold' }}>•</span>
                        <span style={{ color: '#475569' }}><strong style={{ color: '#334155' }}>Salary:</strong> {student.stipend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Letter Body Paragraph 2 */}
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, marginBottom: '24px', zIndex: 10, position: 'relative' }}>
                    We look forward to your contribution and growth with us. Please confirm your acceptance by replying to this letter before <strong style={{ color: '#0F172A' }}>{customFields.expirationDate}</strong>.
                  </div>
                </div>

                {/* Signature and Closing Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, position: 'relative', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                    {/* Empty placeholder for layout alignment if needed */}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', width: '220px', zIndex: 10 }}>
                    <span style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>Sincerely,</span>
                    
                    {/* Dynamic Signature Renderer */}
                    <div style={{ height: '55px', position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '4px', width: '100%' }}>
                      {signatureImage ? (
                        <img
                          src={signatureImage}
                          alt="Uploaded Company Signature"
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{
                          fontSize: '11px',
                          color: '#EF4444',
                          fontStyle: 'italic',
                          border: '1px dashed #FCA5A5',
                          background: '#FEF2F2',
                          padding: '8px',
                          borderRadius: '4px',
                          textAlign: 'center',
                          width: '100%',
                          fontWeight: 500
                        }}>
                          ⚠️ Signature Image Required
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F172A' }}>{customFields.hrContact.split(',')[0]}</span>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>
                      {customFields.hrContact.split(',')[1]?.trim() || 'HRD'}, {customFields.companyName}
                    </span>
                  </div>
                </div>

                {/* Bottom right decorative waves */}
                <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '220px', height: '110px', pointerEvents: 'none' }}>
                  <path d="M 0 110 C 80 78, 110 38, 220 28" fill="none" stroke="#DCFCE7" strokeWidth="1.5" />
                  <path d="M 30 110 C 110 68, 140 18, 220 3" fill="none" stroke="#DCFCE7" strokeWidth="1.5" />
                  <path d="M 60 110 C 140 58, 170 -2, 220 -22" fill="none" stroke="#DCFCE7" strokeWidth="1.5" />
                </svg>

                {/* Footer contact info on the bottom right (layered above waves) */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '16px',
                  zIndex: 20,
                  fontSize: '8.5px',
                  color: '#64748B',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px'
                }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{customFields.companyPhone || "+123-456-7890"}</span>
                  <span style={{ color: '#0A5C36', fontWeight: 600 }}>{customFields.companyEmail || "hello@reallygreatsite.com"}</span>
                  <span>{customFields.companyAddress || "123 Anywhere St., Any City"}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-md)" }}>
              <button
                onClick={handleGeneratePDF}
                disabled={generating || !selectedApplication || !signatureImage}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "white",
                  color: "var(--color-foreground)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  fontWeight: 600,
                  cursor: generating || !selectedApplication || !signatureImage ? "not-allowed" : "pointer",
                  transition: "all var(--transition-fast)",
                  opacity: generating || !selectedApplication || !signatureImage ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !generating && selectedApplication && signatureImage && (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={(e) => !generating && selectedApplication && signatureImage && (e.currentTarget.style.background = "white")}
              >
                {generating ? "Processing..." : "📄 Generate PDF"}
              </button>
              <button
                onClick={handleSendEmail}
                disabled={generating || !generatedOfferId}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: generatedOfferId ? "var(--gradient-brand)" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontWeight: 600,
                  cursor: generating || !generatedOfferId ? "not-allowed" : "pointer",
                  boxShadow: "var(--shadow-md)",
                  transition: "all var(--transition-fast)",
                  opacity: generating || !generatedOfferId ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !generating && generatedOfferId && (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={(e) => !generating && generatedOfferId && (e.currentTarget.style.transform = "translateY(0)")}
              >
                {generating ? "Sending..." : "✉️ Send to Student"}
              </button>
            </div>

            {successMsg && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(34,197,94,0.1)",
                  color: "var(--color-success)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: "var(--radius)",
                  fontWeight: 500,
                  animation: "fadeInUp 0.3s ease",
                }}
              >
                ✓ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "var(--radius)",
                  fontWeight: 500,
                  animation: "fadeInUp 0.3s ease",
                }}
              >
                ✗ {errorMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
