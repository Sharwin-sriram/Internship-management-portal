'use client';

import React, { useState, useRef } from 'react';
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

  const [signature, setSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // get coordinates
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const handleSubmit = () => {
    if (!signature) {
      alert('Please provide a signature before submitting.');
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
                    {isStudent ? 'Jane Smith (HR)' : 'John Doe'}
                  </div>
                  <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Date: 2026-05-18</p>
                </div>
                
                {/* User Signature */}
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: 'var(--space-sm)' }}>Your Signature ({user?.name || 'Signer'}):</p>
                  <div style={{ position: 'relative' }}>
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={100}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseOut={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{ 
                        border: '1px solid var(--color-border)', 
                        borderRadius: 'var(--radius-sm)', 
                        background: '#fafafa',
                        cursor: 'crosshair',
                        touchAction: 'none'
                      }}
                    />
                    <button 
                      onClick={clearSignature}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
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
