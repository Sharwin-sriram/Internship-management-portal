'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getJson } from '../../../../lib/api';

const templates = [
  { id: 't1', name: 'Standard Software Engineering Intern' },
  { id: 't2', name: 'Data Science Intern (Stipend)' },
  { id: 't3', name: 'Business Analyst Intern (Unpaid)' }
];

const mockStudents = [
  { id: 's1', name: 'Jane Doe', role: 'Software Engineering Intern', startDate: '2026-06-01', stipend: '$5000/mo' },
  { id: 's2', name: 'John Smith', role: 'Data Science Intern', startDate: '2026-06-15', stipend: '$5500/mo' }
];

export default function OfferLetterGenerator() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0].id);
  
  const student = mockStudents.find(s => s.id === selectedStudent)!;
  
  // Calculate dynamic default expiration date (30 days from now)
  const defaultExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [customFields, setCustomFields] = useState({
    companyName: user?.name || 'Tech Innovators Inc.',
    hrContact: 'Alice Johnson, HR Manager',
    expirationDate: defaultExpirationDate
  });

  const [signatureType, setSignatureType] = useState<'default' | 'upload'>('default');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
        const res = await getJson<{ success: boolean; data: any }>('/companies/me');
        if (res.ok && res.body?.success && res.body.data) {
          const profile = res.body.data;
          setCustomFields(prev => ({
            ...prev,
            companyName: profile.company_name || profile.legal_name || prev.companyName,
            hrContact: profile.primary_contact?.name 
              ? `${profile.primary_contact.name}${profile.primary_contact.title ? `, ${profile.primary_contact.title}` : ''}`
              : prev.hrContact
          }));
        }
      } catch (error) {
        console.error('Failed to load company profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (user && user.role === 'company') {
      loadCompanyProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [user]);

  const handleAction = async (action: 'download' | 'send') => {
    setGenerating(true);
    setSuccessMsg('');
    
    try {
      const token = localStorage.getItem('internship_token');
      
      const payload = {
        candidateName: student.name,
        position: student.role,
        startDate: student.startDate,
        location: 'Main Office',
        salary: student.stipend,
        companyName: customFields.companyName,
        expirationDate: customFields.expirationDate,
        hrContact: customFields.hrContact,
        hrContactTitle: 'HRD',
        signatureType,
        signatureImage: signatureType === 'upload' ? signatureImage : null
      };

      const res = await fetch('http://localhost:9933/api/offer-letters/generate-model-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.name.replace(/\s+/g, '_')}_Offer_Letter.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg(action === 'download' ? 'Offer Letter PDF downloaded successfully!' : 'Offer Letter sent to student successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please make sure the backend server is running.');
    } finally {
      setGenerating(false);
    }
  };

  const templateContent = `
Dear ${student.name},

We are thrilled to offer you the position of ${student.role} at ${customFields.companyName}. 
We were extremely impressed by your skills and believe you will be a great addition to our team.

Your internship will begin on ${student.startDate}.
Compensation: ${student.stipend}

Please review the attached contract for full terms and conditions. 
This offer is valid until ${customFields.expirationDate}.

Sincerely,
${customFields.hrContact}
${customFields.companyName}
  `.trim();

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-xs)' }}>Offer Letter Generator</h1>
        <p style={{ color: 'var(--color-muted)' }}>Create, customize, and send offer letters to selected candidates.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Configuration</span>
              {loadingProfile && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 'normal' }}>
                  ⏳ Loading profile...
                </span>
              )}
            </h2>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Select Candidate</label>
              <select 
                value={selectedStudent} 
                onChange={e => setSelectedStudent(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
              >
                {mockStudents.map(s => <option key={s.id} value={s.id}>{s.name} - {s.role}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Template</label>
              <select 
                value={selectedTemplate} 
                onChange={e => setSelectedTemplate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
              >
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Company Name</label>
              <input 
                type="text" 
                value={customFields.companyName} 
                onChange={e => setCustomFields(prev => ({ ...prev, companyName: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>HR Contact</label>
              <input 
                type="text" 
                value={customFields.hrContact} 
                onChange={e => setCustomFields(prev => ({ ...prev, hrContact: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
              />
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
                        setSignatureType('default');
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

        {/* Preview Column */}
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
                    <span style={{ color: '#64748B' }}>123 Anywhere St., Any City ST 1234</span>
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
                  <div style={{ height: '55px', position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    {signatureType === 'default' ? (
                      <svg viewBox="0 0 240 80" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                        <path
                          d="M 25 45 C 15 10, 40 5, 30 40 C 20 70, 5 60, 65 42 C 75 35, 82 35, 85 50 C 90 40, 95 42, 98 50 C 102 30, 110 30, 107 50 C 112 40, 122 40, 122 52 C 118 75, 102 72, 128 45 C 136 32, 150 30, 144 50 C 140 70, 132 72, 152 46 C 156 38, 162 40, 166 48 C 174 38, 190 38, 205 50"
                          fill="none"
                          stroke="#0A5C36"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : signatureImage ? (
                      <img
                        src={signatureImage}
                        alt="Uploaded Company Signature"
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic', border: '1px dashed var(--color-border)', padding: '6px', borderRadius: '4px', textAlign: 'center', width: '100%' }}>
                        No signature image uploaded
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
                <span style={{ fontWeight: 600, color: '#334155' }}>+123-456-7890</span>
                <span style={{ color: '#0A5C36', fontWeight: 600 }}>hello@reallygreatsite.com</span>
                <span>123 Anywhere St., Any City</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button 
              onClick={() => handleAction('download')}
              disabled={generating}
              style={{ flex: 1, padding: '12px 20px', background: 'white', color: 'var(--color-foreground)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', transition: 'all var(--transition-fast)' }}
              onMouseEnter={e => !generating && (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => !generating && (e.currentTarget.style.background = 'white')}
            >
              {generating ? 'Processing...' : '📄 Generate PDF'}
            </button>
            <button 
              onClick={() => handleAction('send')}
              disabled={generating}
              style={{ flex: 1, padding: '12px 20px', background: 'var(--gradient-brand)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-md)', transition: 'all var(--transition-fast)' }}
              onMouseEnter={e => !generating && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => !generating && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {generating ? 'Sending...' : '✉️ Download & Send'}
            </button>
          </div>

          {successMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius)', fontWeight: 500, animation: 'fadeInUp 0.3s ease' }}>
              ✓ {successMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
