'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getJson, postAuthJson, BASE_URL } from '../../../../lib/api';

const templates = [
  { id: 't1', name: 'Standard Software Engineering Intern' },
  { id: 't2', name: 'Data Science Intern (Stipend)' },
  { id: 't3', name: 'Business Analyst Intern (Unpaid)' }
];

interface Application {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  internship: {
    _id: string;
    title: string;
    company: {
      _id: string;
      name: string;
    };
  };
  status: string;
}

export default function OfferLetterGenerator() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  
  const [customFields, setCustomFields] = useState({
    companyName: user?.name || 'Tech Innovators Inc.',
    hrContact: 'Alice Johnson, HR Manager',
    expirationDate: defaultExpirationDate,
    salary: '5000',
    duration: '12',
    location: 'Remote',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    responsibilities: 'Develop software features\nCollaborate with team\nParticipate in code reviews',
    benefits: 'Health insurance\nFlexible working hours\nLearning opportunities'
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedOfferId, setGeneratedOfferId] = useState<string | null>(null);

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

    async function loadApplications() {
      try {
        const res = await getJson<{ success: boolean; data: Application[] }>('/applications');
        if (res.ok && res.body?.success && res.body.data) {
          // Filter for selected applications only
          const selectedApps = res.body.data.filter(app => app.status === 'selected');
          setApplications(selectedApps);
          if (selectedApps.length > 0) {
            setSelectedApplication(selectedApps[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setLoadingApplications(false);
      }
    }

    if (user && user.role === 'company') {
      loadCompanyProfile();
      loadApplications();
    } else {
      setLoadingProfile(false);
      setLoadingApplications(false);
    }
  }, [user]);

  const handleGeneratePDF = async () => {
    if (!selectedApplication) {
      setErrorMsg('Please select a candidate');
      return;
    }

    setGenerating(true);
    setSuccessMsg('');
    setErrorMsg('');
    setGeneratedOfferId(null);

    try {
      // First, generate the offer letter
      const generateRes = await postAuthJson<{ success: boolean; data: any }>('/offer-letters/generate', {
        applicationId: selectedApplication,
        templateId: selectedTemplate !== 't1' ? selectedTemplate : null,
        customDetails: {
          salary: customFields.salary,
          duration: customFields.duration,
          location: customFields.location,
          start_date: customFields.startDate,
          responsibilities: customFields.responsibilities.split('\n').filter(r => r.trim()),
          benefits: customFields.benefits.split('\n').filter(b => b.trim())
        }
      });

      if (!generateRes.ok || !generateRes.body?.success) {
        throw new Error(generateRes.body?.message || 'Failed to generate offer letter');
      }

      const offerId = generateRes.body.data._id;
      setGeneratedOfferId(offerId);

      // Then, generate the PDF
      const pdfRes = await postAuthJson<{ success: boolean; data: any }>(`/offer-letters/${offerId}/generate-pdf`, {});

      if (!pdfRes.ok || !pdfRes.body?.success) {
        throw new Error(pdfRes.body?.message || 'Failed to generate PDF');
      }

      setSuccessMsg('Offer Letter PDF generated successfully! Click "Send to Student" to email it.');
      
      // Auto-download the PDF
      const token = localStorage.getItem('token');
      if (token) {
        const downloadUrl = `${BASE_URL}/offer-letters/${offerId}/download`;
        
        // Create a temporary link and trigger download
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `offer-letter-${offerId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
      
    } catch (error: any) {
      console.error('Generate PDF error:', error);
      setErrorMsg(error.message || 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedOfferId) {
      setErrorMsg('Please generate the PDF first');
      return;
    }

    setGenerating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await postAuthJson<{ success: boolean; data: any }>(`/offer-letters/${generatedOfferId}/send`, {});

      if (!res.ok || !res.body?.success) {
        throw new Error(res.body?.message || 'Failed to send offer letter');
      }

      setSuccessMsg('Offer Letter sent to student successfully!');
    } catch (error: any) {
      console.error('Send email error:', error);
      setErrorMsg(error.message || 'Failed to send offer letter');
    } finally {
      setGenerating(false);
    }
  };

  const selectedApp = applications.find(app => app._id === selectedApplication);
  
  const templateContent = selectedApp ? `
Dear ${selectedApp.student.name},

We are thrilled to offer you the position of ${selectedApp.internship.title} at ${customFields.companyName}. 
We were extremely impressed by your skills and believe you will be a great addition to our team.

Your internship will begin on ${customFields.startDate}.
Compensation: ₹${customFields.salary}/mo
Duration: ${customFields.duration} weeks
Location: ${customFields.location}

Key Responsibilities:
${customFields.responsibilities.split('\n').map(r => `• ${r}`).join('\n')}

Benefits:
${customFields.benefits.split('\n').map(b => `• ${b}`).join('\n')}

Please review the attached contract for full terms and conditions. 
This offer is valid until ${customFields.expirationDate}.

Sincerely,
${customFields.hrContact}
${customFields.companyName}
  `.trim() : 'Please select a candidate to preview the offer letter.';

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-xs)' }}>Offer Letter Generator</h1>
        <p style={{ color: 'var(--color-muted)' }}>Create, customize, and send offer letters to selected candidates.</p>
      </div>

      {loadingApplications ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-muted)' }}>No selected candidates found. Please select candidates from applications first.</p>
        </div>
      ) : (
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
                  value={selectedApplication} 
                  onChange={e => setSelectedApplication(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                >
                  {applications.map(app => (
                    <option key={app._id} value={app._id}>
                      {app.student.name} - {app.internship.title}
                    </option>
                  ))}
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
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Salary (₹/month)</label>
                <input 
                  type="number" 
                  value={customFields.salary} 
                  onChange={e => setCustomFields(prev => ({ ...prev, salary: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Duration (weeks)</label>
                <input 
                  type="number" 
                  value={customFields.duration} 
                  onChange={e => setCustomFields(prev => ({ ...prev, duration: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Location</label>
                <input 
                  type="text" 
                  value={customFields.location} 
                  onChange={e => setCustomFields(prev => ({ ...prev, location: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Start Date</label>
                <input 
                  type="date" 
                  value={customFields.startDate} 
                  onChange={e => setCustomFields(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Responsibilities (one per line)</label>
                <textarea 
                  value={customFields.responsibilities} 
                  onChange={e => setCustomFields(prev => ({ ...prev, responsibilities: e.target.value }))}
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 6 }}>Benefits (one per line)</label>
                <textarea 
                  value={customFields.benefits} 
                  onChange={e => setCustomFields(prev => ({ ...prev, benefits: e.target.value }))}
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)', outline: 'none', fontFamily: 'inherit' }}
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
            </div>
          </div>

          {/* Preview Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', minHeight: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>Document Preview</h2>
                <span style={{ fontSize: 'var(--font-size-xs)', padding: '4px 10px', background: 'var(--color-primary-10)', color: 'var(--color-primary)', borderRadius: '99px', fontWeight: 600 }}>Live Edit</span>
              </div>
              
              <div style={{ 
                background: '#f9fafb', 
                padding: 'var(--space-xl)', 
                borderRadius: 'var(--radius)', 
                border: '1px solid #e5e7eb',
                fontFamily: 'serif',
                fontSize: '1rem',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                color: '#374151',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}>
                {templateContent}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button 
                onClick={handleGeneratePDF}
                disabled={generating || !selectedApplication}
                style={{ flex: 1, padding: '12px 20px', background: 'white', color: 'var(--color-foreground)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: (generating || !selectedApplication) ? 'not-allowed' : 'pointer', transition: 'all var(--transition-fast)', opacity: (generating || !selectedApplication) ? 0.6 : 1 }}
                onMouseEnter={e => !generating && selectedApplication && (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={e => !generating && selectedApplication && (e.currentTarget.style.background = 'white')}
              >
                {generating ? 'Processing...' : '📄 Generate PDF'}
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={generating || !generatedOfferId}
                style={{ flex: 1, padding: '12px 20px', background: generatedOfferId ? 'var(--gradient-brand)' : '#ccc', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: (generating || !generatedOfferId) ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-md)', transition: 'all var(--transition-fast)', opacity: (generating || !generatedOfferId) ? 0.6 : 1 }}
                onMouseEnter={e => !generating && generatedOfferId && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => !generating && generatedOfferId && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {generating ? 'Sending...' : '✉️ Send to Student'}
              </button>
            </div>

            {successMsg && (
              <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius)', fontWeight: 500, animation: 'fadeInUp 0.3s ease' }}>
                ✓ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', fontWeight: 500, animation: 'fadeInUp 0.3s ease' }}>
                ✗ {errorMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
