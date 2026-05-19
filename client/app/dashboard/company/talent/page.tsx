'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getJson, postAuthJson } from '../../../../lib/api';
import Button from '../../../../components/ui/Button';

interface TalentProfile {
  id: string;
  name: string;
  branch: string;
  cgpa: number;
  graduation_year: number;
  skills: string[];
  contact: { email?: string } | null;
  contact_status: 'locked' | 'unlocked' | 'pending';
}

export default function CompanyTalentPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [filters, setFilters] = useState({ skill: '', branch: '', minCgpa: '', graduationYear: '' });
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && user.role !== 'company') router.push('/dashboard');
  }, [user, isLoading, router]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.skill) params.set('skill', filters.skill);
    if (filters.branch) params.set('branch', filters.branch);
    if (filters.minCgpa) params.set('minCgpa', filters.minCgpa);
    if (filters.graduationYear) params.set('graduationYear', filters.graduationYear);

    const res = await getJson<{ success: boolean; data: TalentProfile[] }>(`/companies/talent/search?${params.toString()}`);
    setLoading(false);

    if (res.ok && res.body?.success) {
      setTalent(res.body.data.map(item => ({ ...item, contact_status: item.contact_status || 'locked' })));
      return;
    }

    setMessage('Unable to load talent search results.');
  }

  async function handleUnlockRequest(studentId: string) {
    setMessage('');
    const res = await postAuthJson<{ success: boolean; data: { status: string } }>(
      '/companies/talent/requests',
      { studentId },
    );

    if (res.ok && res.body?.success) {
      setTalent(prev => prev.map(item => (
        item.id === studentId ? { ...item, contact_status: 'pending' } : item
      )));
      setMessage('Unlock request sent to coordinator.');
      return;
    }

    setMessage('Unable to request contact unlock.');
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 0 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, marginBottom: 6 }}>Talent Search</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Discover eligible students and request contact unlocks.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: 22, border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          <input
            placeholder="Skill"
            value={filters.skill}
            onChange={e => setFilters(prev => ({ ...prev, skill: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          />
          <input
            placeholder="Branch"
            value={filters.branch}
            onChange={e => setFilters(prev => ({ ...prev, branch: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          />
          <input
            placeholder="Min CGPA"
            value={filters.minCgpa}
            onChange={e => setFilters(prev => ({ ...prev, minCgpa: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          />
          <input
            placeholder="Grad Year"
            value={filters.graduationYear}
            onChange={e => setFilters(prev => ({ ...prev, graduationYear: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          />
          <Button variant="primary" type="submit" loading={loading} style={{ background: '#0f172a', boxShadow: '0 4px 14px rgba(15,23,42,0.25)' }}>
            Search
          </Button>
        </form>
      </div>

      {message && (
        <p style={{ color: '#1d4ed8', fontWeight: 600, marginBottom: 12 }}>{message}</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {talent.length === 0 && (
          <p style={{ color: '#94a3b8', margin: 0 }}>No results yet. Use filters to search.</p>
        )}
        {talent.map(student => (
          <div key={student.id} style={{ padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <strong>{student.name}</strong>
                <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {student.branch} · CGPA {student.cgpa} · {student.graduation_year}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{student.skills.join(', ')}</p>
              </div>
              <div>
                {student.contact_status === 'unlocked' && (
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>Contact unlocked</span>
                )}
                {student.contact_status === 'pending' && (
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>Pending approval</span>
                )}
                {student.contact_status === 'locked' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUnlockRequest(student.id)}
                  >
                    Request contact
                  </Button>
                )}
              </div>
            </div>
            {student.contact_status === 'unlocked' && student.contact?.email && (
              <p style={{ marginTop: 8, fontSize: '0.85rem', color: '#0f172a' }}>{student.contact.email}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
