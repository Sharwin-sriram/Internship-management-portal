'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getJson, postForm } from '../../../../lib/api';

type DocType = 'Resume' | 'Cover Letter' | 'Certificates' | 'ID Proofs';

interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  size: number;
  url?: string;
}

interface DocumentItem {
  type: DocType;
  currentVersion: DocumentVersion | null;
  history: DocumentVersion[];
}

interface BackendDocument {
  _id: string;
  doc_type: string;
  storage_url: string;
  version: number;
  is_verified: boolean;
  createdAt: string;
  user: any;
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

  const fetchDocuments = useCallback(async () => {
    const res = await getJson<{ success: boolean, data: BackendDocument[] }>('/documents');
    if (res.ok && res.body?.success) {
      const docsFromBackend = res.body.data;
      
      const newDocs: DocumentItem[] = [
        { type: 'Resume', currentVersion: null, history: [] },
        { type: 'Cover Letter', currentVersion: null, history: [] },
        { type: 'Certificates', currentVersion: null, history: [] },
        { type: 'ID Proofs', currentVersion: null, history: [] },
      ];

      const typeMap: Record<string, DocType> = {
        'resume': 'Resume',
        'cover_letter': 'Cover Letter',
        'certificate': 'Certificates',
        'id_proof': 'ID Proofs'
      };

      docsFromBackend.forEach(doc => {
        const frontendType = typeMap[doc.doc_type];
        if (frontendType) {
          const docItem = newDocs.find(d => d.type === frontendType)!;
          const fileName = doc.storage_url.split('/').pop() || 'document';
          
          // Decode URL encoded filename components if possible
          let decodedName = fileName;
          try {
             decodedName = decodeURIComponent(fileName.split('-').slice(0, -1).join('-') || fileName);
          } catch (e) {
             // fallback
          }

          const versionObj: DocumentVersion = {
            id: doc._id,
            version: doc.version,
            fileName: decodedName,
            uploadDate: new Date(doc.createdAt).toISOString().split('T')[0],
            uploadedBy: doc.user?.name || user?.name || 'Student',
            size: 0, // Not provided by the backend listing currently
            url: `http://localhost:9933${doc.storage_url}`
          };

          docItem.history.push(versionObj);
        }
      });

      // Sort history descending by version
      newDocs.forEach(doc => {
        if (doc.history.length > 0) {
          doc.history.sort((a, b) => b.version - a.version);
          doc.currentVersion = doc.history[0];
          doc.history = doc.history.slice(1);
        }
      });

      setDocuments(newDocs);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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

  const handleFileUpload = async (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    
    setError('');
    setUploading(true);
    setUploadProgress(0);

    const docTypeMap: Record<DocType, string> = {
      'Resume': 'resume',
      'Cover Letter': 'cover_letter',
      'Certificates': 'certificate',
      'ID Proofs': 'id_proof'
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docTypeMap[activeTab]);

    // Simulated progress just for UX
    const interval = setInterval(() => {
      setUploadProgress(prev => prev >= 90 ? 90 : prev + 10);
    }, 200);

    const res = await postForm('/documents/upload', formData);
    
    clearInterval(interval);
    setUploadProgress(100);
    
    if (res.ok) {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        fetchDocuments(); // Refresh the list
      }, 500);
    } else {
      setUploading(false);
      setUploadProgress(0);
      setError((res.body as any)?.message || 'Upload failed');
    }
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
    // In a full implementation, you would make an API call to set this version as active
    // or duplicate it as a new version.
    alert('Restoring older versions via API is not fully implemented yet.');
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
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                  e.target.value = ''; // Reset input to allow re-uploading the same file
                }
              }}
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
                  <p style={{ fontWeight: 600 }}>
                    {activeDoc.currentVersion.url ? (
                      <a href={activeDoc.currentVersion.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                        {activeDoc.currentVersion.fileName}
                      </a>
                    ) : (
                      activeDoc.currentVersion.fileName
                    )}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                    v{activeDoc.currentVersion.version} • Uploaded on {activeDoc.currentVersion.uploadDate} by {activeDoc.currentVersion.uploadedBy}
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
                      <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                        {v.url ? (
                          <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                            {v.fileName}
                          </a>
                        ) : (
                          v.fileName
                        )}
                      </p>
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
