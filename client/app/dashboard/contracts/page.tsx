'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function ContractsPage() {
  const { user } = useAuth();
  
  // Mock data setup based on role
  const isStudent = user?.role === 'student';
  const roleName = isStudent ? (user?.name || 'Student') : 'Company Representative';

  const [studentName, setStudentName] = useState(isStudent ? roleName : 'Jane Doe');
  const [companyName, setCompanyName] = useState(!isStudent ? (user?.name || 'Tech Innovators Inc.') : 'Tech Innovators Inc.');
  const [roleTitle, setRoleTitle] = useState('Software Engineering Intern');
  const [duration, setDuration] = useState('3 Months (June 1 - Aug 31, 2026)');

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!signatureFile) {
      alert('Please upload a signature document (PDF, Word, or Image) before submitting.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-xs)' }}>Internship Contract</h1>
        <p style={{ color: 'var(--color-muted)' }}>Review and sign the finalized internship agreement.</p>
      </div>

      {success ? (
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-3xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🎉</div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-sm)' }}>Contract Signed Successfully!</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-xl)' }}>Your digitally signed contract has been saved and shared with the respective parties.</p>
          <button 
            onClick={() => setSuccess(false)}
            style={{ padding: '12px 24px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
          >
            Back to Contracts
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Settings / Auto-fill Info */}
          {!isStudent && (
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>Contract Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>Company Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>Student Name</label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>Role</label>
                  <input type="text" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>Duration</label>
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                </div>
              </div>
            </div>
          )}

          {/* Contract Preview */}
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', fontFamily: 'serif' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-xl)', fontSize: '1.5rem', fontWeight: 'bold' }}>INTERNSHIP AGREEMENT</h2>
            
            <p style={{ marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              This Internship Agreement ("Agreement") is entered into by and between <strong>{companyName}</strong> ("Company") and <strong>{studentName}</strong> ("Intern").
            </p>
            
            <h3 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>1. Position and Duties</h3>
            <p style={{ marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              The Intern will serve as a <strong>{roleTitle}</strong>. The Intern will perform such duties as may be assigned by the Company from time to time.
            </p>
            
            <h3 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>2. Term</h3>
            <p style={{ marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              The internship will last for a period of <strong>{duration}</strong>. This Agreement may be terminated by either party at any time with a 2-week notice.
            </p>

            <h3 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>3. Confidentiality</h3>
            <p style={{ marginBottom: 'var(--space-xl)', lineHeight: 1.8 }}>
              During the course of the internship, the Intern will have access to confidential information. The Intern agrees to hold all such information in strict confidence.
            </p>

            {/* Signature Area */}
            <div style={{ marginTop: 'var(--space-2xl)', borderTop: '2px dashed var(--color-border)', paddingTop: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-md)' }}>Signatures</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2xl)' }}>
                {/* Counterparty Signature (Mock) */}
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: 'var(--space-sm)' }}>For {isStudent ? 'Company' : 'Student'}:</p>
                  <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid black', fontFamily: 'cursive', fontSize: '1.2rem', color: '#6b7280', minHeight: '60px' }}>
                    {isStudent ? `${companyName} (HR)` : studentName}
                  </div>
                  <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Date: {new Date().toISOString().split('T')[0]}</p>
                </div>
                
                {/* User Signature */}
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: 'var(--space-sm)' }}>Your Signature ({isStudent ? studentName : companyName}):</p>
                  <div style={{ 
                    border: '2px dashed var(--color-border)', 
                    borderRadius: 'var(--radius-sm)', 
                    background: '#fafafa',
                    padding: 'var(--space-md)',
                    textAlign: 'center'
                  }}>
                    <input 
                      type="file" 
                      id="signature-upload"
                      accept=".pdf,.doc,.docx,image/png,image/jpeg" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSignatureFile(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label 
                      htmlFor="signature-upload" 
                      style={{ 
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'border-color var(--transition-fast)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    >
                      Upload Signature
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-subtle)', marginTop: 8 }}>
                      Supports PDF, Word, JPG, PNG
                    </p>
                    
                    {signatureFile && (
                      <div style={{ marginTop: 12, padding: '8px', background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📄 {signatureFile.name}
                        </span>
                        <button 
                          onClick={() => setSignatureFile(null)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 'bold' }}
                          title="Remove file"
                        >✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                style={{ 
                  padding: '14px 32px', 
                  fontSize: '1.1rem',
                  background: 'var(--gradient-brand)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 'var(--radius-lg)', 
                  fontWeight: 'bold', 
                  cursor: submitting ? 'not-allowed' : 'pointer', 
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform var(--transition-fast)'
                }}
              >
                {submitting ? 'Submitting Contract...' : 'Submit Signed Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
