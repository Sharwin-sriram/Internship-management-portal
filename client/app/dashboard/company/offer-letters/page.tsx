'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';

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
  
  const [customFields, setCustomFields] = useState({
    companyName: user?.name || 'Tech Innovators Inc.',
    hrContact: 'Alice Johnson, HR Manager',
    expirationDate: '2026-05-30'
  });

  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAction = (action: 'download' | 'send') => {
    setGenerating(true);
    setSuccessMsg('');
    setTimeout(() => {
      setGenerating(false);
      setSuccessMsg(action === 'download' ? 'Offer Letter PDF downloaded successfully!' : 'Offer Letter sent to student successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1500);
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
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>Configuration</h2>
            
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
