'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getJson, postAuthJson, deleteJson } from '../../../../lib/api';
import Button from '../../../../components/ui/Button';

interface Recruiter {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
}

export default function CompanyRecruitersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', title: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && user.role !== 'company') router.push('/dashboard');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'company') return;
    const load = async () => {
      setLoading(true);
      const res = await getJson<{ success: boolean; data: Recruiter[] }>('/companies/me/recruiters');
      if (res.ok && res.body?.success) {
        setRecruiters(res.body.data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    const res = await postAuthJson<{ success: boolean; data: Recruiter[] }>('/companies/me/recruiters', form);
    setSaving(false);

    if (res.ok && res.body?.success) {
      setRecruiters(res.body.data || []);
      setForm({ name: '', email: '', phone: '', title: '' });
      setMessage('Recruiter added.');
      return;
    }

    setMessage('Unable to add recruiter.');
  }

  async function handleRemove(recruiterId?: string) {
    if (!recruiterId) return;
    setMessage('');
    const res = await deleteJson(`/companies/me/recruiters/${recruiterId}`);
    if (res.ok) {
      setRecruiters(prev => prev.filter(rec => rec._id !== recruiterId));
      setMessage('Recruiter removed.');
      return;
    }
    setMessage('Unable to remove recruiter.');
  }

  if (loading || isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 0 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, marginBottom: 6 }}>Recruiting Team</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Manage recruiters under your company account.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 22, border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {recruiters.length === 0 && (
              <p style={{ color: '#94a3b8', margin: 0 }}>No recruiters added yet.</p>
            )}
            {recruiters.map(rec => (
              <div key={rec._id || rec.email} style={{ padding: 12, borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>{rec.name}</strong>
                  <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.85rem' }}>{rec.title || 'Recruiter'} · {rec.email}</p>
                  {rec.phone && (
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>{rec.phone}</p>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemove(rec._id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 22, border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: 700 }}>Add recruiter</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: 10 }}>
            <input
              placeholder="Full name"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              required
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <Button
              variant="primary"
              type="submit"
              loading={saving}
              fullWidth
            >
              Add recruiter
            </Button>
          </form>

          {message && (
            <p style={{ marginTop: 12, color: '#1d4ed8', fontWeight: 600 }}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
