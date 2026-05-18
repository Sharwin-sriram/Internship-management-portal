'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';

type DocType = 'Resume' | 'Cover Letter' | 'Certificates' | 'ID Proofs';

interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  size: number;
}

interface DocumentItem {
  type: DocType;
  currentVersion: DocumentVersion | null;
  history: DocumentVersion[];
}

const initialDocs: DocumentItem[] = [
  { type: 'Resume', currentVersion: null, history: [] },
  { type: 'Cover Letter', currentVersion: null, history: [] },
  { type: 'Certificates', currentVersion: null, history: [] },
  { type: 'ID Proofs', currentVersion: null, history: [] },
];

export default function DocumentUploadPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocs);
  const [activeTab, setActiveTab] = useState<DocType>('Resume');
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDoc = documents.find(d => d.type === activeTab)!;

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return 'Invalid file format. Please upload PDF, DOCX, JPG, or PNG.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleFileUpload = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    
    setError('');
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishUpload(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const finishUpload = (file: File) => {
    setUploading(false);
    setUploadProgress(0);

    const newVersion: DocumentVersion = {
      id: Math.random().toString(36).substring(7),
      version: (activeDoc.currentVersion?.version || 0) + 1,
      fileName: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: user?.name || 'Student',
      size: file.size,
    };

    setDocuments(prev => prev.map(d => {
      if (d.type === activeTab) {
        return {
          ...d,
          currentVersion: newVersion,
          history: d.currentVersion ? [d.currentVersion, ...d.history] : d.history,
        };
      }
      return d;
    }));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const restoreVersion = (version: DocumentVersion) => {
    setDocuments(prev => prev.map(d => {
      if (d.type === activeTab) {
        // Move current to history, set selected as current
        const newHistory = d.history.filter(v => v.id !== version.id);
        if (d.currentVersion) newHistory.unshift(d.currentVersion);
        // sort by version descending
        newHistory.sort((a, b) => b.version - a.version);
        
        return {
          ...d,
          currentVersion: version,
          history: newHistory,
        };
      }
      return d;
    }));
  };

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-xs)' }}>Document Management</h1>
        <p style={{ color: 'var(--color-muted)' }}>Upload and manage your required internship documents.</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {documents.map(doc => (
            <button
              key={doc.type}
              onClick={() => { setActiveTab(doc.type); setError(''); }}
              style={{
                textAlign: 'left',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: activeTab === doc.type ? 'var(--color-primary-10)' : 'transparent',
                color: activeTab === doc.type ? 'var(--color-primary)' : 'var(--color-foreground)',
                fontWeight: activeTab === doc.type ? 700 : 500,
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {doc.type}
              {doc.currentVersion && <span style={{ color: 'var(--color-success)', fontSize: '1.2rem' }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: '3 1 500px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-md)' }}>{activeTab}</h2>
          
          {/* Upload Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-2xl)',
              textAlign: 'center',
              background: isDragging ? 'var(--color-primary-10)' : '#fafafa',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-base)',
              marginBottom: 'var(--space-lg)'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.jpg,.png"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📁</div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xs)' }}>
              {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
            </h3>
            <p style={{ color: 'var(--color-subtle)', fontSize: 'var(--font-size-sm)' }}>
              Supported formats: PDF, DOCX, JPG, PNG (Max 5MB)
            </p>

            {uploading && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--gradient-brand)', transition: 'width 0.2s ease' }} />
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginTop: 4 }}>Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>

          {error && <div style={{ color: 'var(--color-error)', background: 'rgba(239,68,68,0.1)', padding: 'var(--space-sm)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

          {/* Current Version */}
          {activeDoc.currentVersion ? (
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}>Current Version</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', border: '1px solid var(--color-primary-20)', borderRadius: 'var(--radius)', background: 'var(--color-primary-10)' }}>
                <div style={{ fontSize: '2rem' }}>📄</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{activeDoc.currentVersion.fileName}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                    v{activeDoc.currentVersion.version} • Uploaded on {activeDoc.currentVersion.uploadDate} by {activeDoc.currentVersion.uploadedBy} • {(activeDoc.currentVersion.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}>No document uploaded yet.</p>
          )}

          {/* Version History */}
          {activeDoc.history.length > 0 && (
            <div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}>Version History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {activeDoc.history.map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-md)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{v.fileName}</p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-subtle)' }}>
                        v{v.version} • {v.uploadDate}
                      </p>
                    </div>
                    <button 
                      onClick={() => restoreVersion(v)}
                      style={{ padding: '6px 12px', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--font-size-xs)', fontWeight: 600, transition: 'all var(--transition-fast)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
