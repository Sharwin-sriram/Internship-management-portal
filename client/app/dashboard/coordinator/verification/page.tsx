'use client';

import React, { useState } from 'react';

type DocStatus = 'Pending' | 'Verified' | 'Rejected';

interface VerificationDoc {
  id: string;
  studentName: string;
  docType: string;
  uploadDate: string;
  status: DocStatus;
  comment?: string;
}

const mockData: VerificationDoc[] = [
  { id: 'd1', studentName: 'Jane Doe', docType: 'Resume', uploadDate: '2026-05-10', status: 'Pending' },
  { id: 'd2', studentName: 'John Smith', docType: 'ID Proofs', uploadDate: '2026-05-12', status: 'Verified' },
  { id: 'd3', studentName: 'Alice Johnson', docType: 'Certificates', uploadDate: '2026-05-14', status: 'Rejected', comment: 'Blurry image, please re-upload.' },
  { id: 'd4', studentName: 'Jane Doe', docType: 'Cover Letter', uploadDate: '2026-05-15', status: 'Pending' },
  { id: 'd5', studentName: 'Bob Williams', docType: 'Resume', uploadDate: '2026-05-16', status: 'Pending' },
];

export default function DocumentVerificationPanel() {
  const [documents, setDocuments] = useState<VerificationDoc[]>(mockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'All'>('All');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || doc.docType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: DocStatus) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, comment: undefined } : d));
  };

  const openRejectModal = (id: string) => {
    setSelectedDocId(id);
    setRejectComment('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (selectedDocId) {
      setDocuments(prev => prev.map(d => d.id === selectedDocId ? { ...d, status: 'Rejected', comment: rejectComment } : d));
    }
    setRejectModalOpen(false);
  };

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-xs)' }}>Document Verification</h1>
        <p style={{ color: 'var(--color-muted)' }}>Review and verify student uploaded documents.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by student or document type..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 300px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none' }}
        />
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as DocStatus | 'All')}
          style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>Student Name</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>Document Type</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>Upload Date</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>Status</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
              <tr key={doc.id} style={{ borderBottom: idx === filteredDocs.length - 1 ? 'none' : '1px solid var(--color-border)', transition: 'background var(--transition-fast)' }}>
                <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{doc.studentName}</td>
                <td style={{ padding: 'var(--space-md)', color: 'var(--color-muted)' }}>{doc.docType}</td>
                <td style={{ padding: 'var(--space-md)', color: 'var(--color-muted)' }}>{doc.uploadDate}</td>
                <td style={{ padding: 'var(--space-md)' }}>
                  <span style={{ 
                    display: 'inline-flex', padding: '4px 10px', borderRadius: '99px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                    background: doc.status === 'Verified' ? 'rgba(34,197,94,0.1)' : doc.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: doc.status === 'Verified' ? 'var(--color-success)' : doc.status === 'Rejected' ? 'var(--color-error)' : '#d97706'
                  }}>
                    {doc.status}
                  </span>
                  {doc.comment && <div style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: 4 }}>Note: {doc.comment}</div>}
                </td>
                <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleStatusChange(doc.id, 'Verified')}
                      disabled={doc.status === 'Verified'}
                      style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: doc.status === 'Verified' ? 'default' : 'pointer', opacity: doc.status === 'Verified' ? 0.5 : 1, fontWeight: 600, fontSize: 'var(--font-size-xs)' }}
                    >✓ Verify</button>
                    <button 
                      onClick={() => openRejectModal(doc.id)}
                      disabled={doc.status === 'Rejected'}
                      style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: doc.status === 'Rejected' ? 'default' : 'pointer', opacity: doc.status === 'Rejected' ? 0.5 : 1, fontWeight: 600, fontSize: 'var(--font-size-xs)' }}
                    >✕ Reject</button>
                    {doc.status !== 'Pending' && (
                      <button 
                        onClick={() => handleStatusChange(doc.id, 'Pending')}
                        style={{ padding: '6px 12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}
                      >↺ Reset</button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-muted)' }}>
                  No documents found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 'var(--space-md)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 400, borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-xl)', animation: 'fadeInUp 0.3s ease' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>Reject Document</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>Please provide a reason for rejection so the student can correct it.</p>
            
            <textarea 
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
              placeholder="e.g., The document is blurry and unreadable."
              style={{ width: '100%', minHeight: 100, padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit', marginBottom: 'var(--space-lg)', resize: 'vertical' }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setRejectModalOpen(false)}
                style={{ padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={confirmReject}
                style={{ padding: '10px 16px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.2)' }}
              >Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
