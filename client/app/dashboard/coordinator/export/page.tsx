'use client';

import React, { useState } from 'react';

const batches = ['2023-2027', '2022-2026', '2021-2025'];
const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'All Departments'];
const docTypes = ['All Documents', 'Resumes', 'Offer Letters', 'Contracts', 'ID Proofs', 'Certificates'];

export default function BulkExportPage() {
  const [selectedBatch, setSelectedBatch] = useState(batches[0]);
  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [selectedType, setSelectedType] = useState(docTypes[0]);
  
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setProgress(0);
    setSuccess(false);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          finishExport();
          return 100;
        }
        return next;
      });
    }, 400);
  };

  const finishExport = () => {
    setExporting(false);
    setSuccess(true);
    // In a real app, this would trigger a file download using a blob URL.
  };

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-xs)' }}>Bulk Document Export</h1>
        <p style={{ color: 'var(--color-muted)' }}>Generate and download ZIP archives of student documents by batch and department.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
        
        {/* Filters Card */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>Export Configuration</h2>
          
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: 6 }}>Batch / Year</label>
            <select 
              value={selectedBatch} 
              onChange={e => setSelectedBatch(e.target.value)}
              disabled={exporting}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none', background: exporting ? '#f9fafb' : 'white' }}
            >
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: 6 }}>Department</label>
            <select 
              value={selectedDept} 
              onChange={e => setSelectedDept(e.target.value)}
              disabled={exporting}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none', background: exporting ? '#f9fafb' : 'white' }}
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: 6 }}>Document Type</label>
            <select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)}
              disabled={exporting}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none', background: exporting ? '#f9fafb' : 'white' }}
            >
              {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: 'var(--gradient-brand)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--radius-lg)', 
              fontWeight: 700, 
              fontSize: '1.05rem',
              cursor: exporting ? 'not-allowed' : 'pointer', 
              boxShadow: 'var(--shadow-md)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
            onMouseEnter={e => !exporting && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
            onMouseLeave={e => !exporting && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
          >
            {exporting ? 'Compiling Archive...' : 'Generate ZIP Archive'}
          </button>
        </div>

        {/* Status / Output Card */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          
          {!exporting && !success && (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)', opacity: 0.5 }}>📦</div>
              <p>Select criteria and click generate to create a downloadable ZIP file containing all matched documents.</p>
            </div>
          )}

          {exporting && (
            <div style={{ width: '100%', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', animation: 'float 3s ease-in-out infinite' }}>⚙️</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>Gathering files...</h3>
              <div style={{ width: '100%', height: 12, background: 'var(--color-border)', borderRadius: 6, overflow: 'hidden', marginBottom: 'var(--space-sm)' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient-brand)', transition: 'width 0.3s ease' }} />
              </div>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{progress}%</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-subtle)', marginTop: 'var(--space-xs)' }}>Compressing and encrypting data...</p>
            </div>
          )}

          {success && (
            <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>✅</div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-foreground)', marginBottom: 'var(--space-xs)' }}>Export Ready!</h3>
              <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-lg)' }}>
                Your archive <strong>{selectedDept.replace(' ', '_')}_{selectedBatch}_Docs.zip</strong> is ready.
              </p>
              <button
                style={{ 
                  padding: '12px 24px', 
                  background: 'white', 
                  color: 'var(--color-success)', 
                  border: '2px solid var(--color-success)', 
                  borderRadius: 'var(--radius)', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                onClick={() => alert('Download starting...')}
              >
                <span>Download ZIP (142MB)</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
