'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getJson, postAuthJson } from '../../../lib/api';

interface CompanyProfile {
  _id: string;
  company_name?: string;
  legal_name?: string;
  industry?: string;
  size?: string;
  website?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  logo_url?: string;
  description?: string;
  social_links?: { platform: string; url: string }[];
  office_locations?: {
    label?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
  }[];
  recruiters?: Recruiter[];
}

interface Recruiter {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
}

interface DashboardMetrics {
  activePostings: number;
  totalApplications: number;
  shortlistedCandidates: number;
  offerConversionRate: number;
  pendingActions: number;
  approvalStatus: string;
}

interface AnalyticsData {
  applicationVolume: { date: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  averageTimeToOfferDays: number;
}

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

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    skill: '',
    branch: '',
    minCgpa: '',
    graduationYear: '',
  });
  const [recruiterForm, setRecruiterForm] = useState({ name: '', email: '', phone: '', title: '' });
  const [actionMessage, setActionMessage] = useState('');

  const profilePromptKey = profile?._id
    ? `company_profile_prompt_dismissed_${profile._id}`
    : 'company_profile_prompt_dismissed';

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && user.role !== 'company') router.push('/dashboard');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'company') return;

    const load = async () => {
      setLoading(true);
      setError('');

      const [profileRes, metricsRes, analyticsRes, recruitersRes] = await Promise.all([
        getJson<{ success: boolean; data: CompanyProfile }>('/companies/me'),
        getJson<{ success: boolean; data: DashboardMetrics }>('/companies/me/dashboard'),
        getJson<{ success: boolean; data: AnalyticsData }>('/companies/me/analytics'),
        getJson<{ success: boolean; data: Recruiter[] }>('/companies/me/recruiters'),
      ]);

      if (profileRes.ok && profileRes.body?.success) {
        setProfile(profileRes.body.data);
      }
      if (metricsRes.ok && metricsRes.body?.success) {
        setMetrics(metricsRes.body.data);
      }
      if (analyticsRes.ok && analyticsRes.body?.success) {
        setAnalytics(analyticsRes.body.data);
      }
      if (recruitersRes.ok && recruitersRes.body?.success) {
        setRecruiters(recruitersRes.body.data || []);
      }

      if (!profileRes.ok) {
        setError('Unable to load company profile.');
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const approvalBadge = useMemo(() => {
    if (!metrics) return { label: 'Pending approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    if (metrics.approvalStatus === 'approved') return { label: 'Approved', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' };
    if (metrics.approvalStatus === 'rejected') return { label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' };
    return { label: 'Pending approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
  }, [metrics]);

  const isProfileIncomplete = useMemo(() => {
    if (!profile) return false;
    return !(
      profile.legal_name &&
      profile.industry &&
      profile.size &&
      profile.website &&
      profile.primary_contact?.name &&
      profile.primary_contact?.email
    );
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    if (!isProfileIncomplete) return;
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem(profilePromptKey);
    if (!dismissed) {
      setShowProfilePrompt(true);
    }
  }, [profile, isProfileIncomplete, profilePromptKey]);

  function handleSkipProfilePrompt() {
    setShowProfilePrompt(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(profilePromptKey, '1');
    }
  }

  async function handleTalentSearch(e: React.FormEvent) {
    e.preventDefault();
    setActionMessage('');

    const params = new URLSearchParams();
    if (searchFilters.skill) params.set('skill', searchFilters.skill);
    if (searchFilters.branch) params.set('branch', searchFilters.branch);
    if (searchFilters.minCgpa) params.set('minCgpa', searchFilters.minCgpa);
    if (searchFilters.graduationYear) params.set('graduationYear', searchFilters.graduationYear);

    const res = await getJson<{ success: boolean; data: TalentProfile[] }>(`/companies/talent/search?${params.toString()}`);
    if (res.ok && res.body?.success) {
      setTalent(res.body.data.map(item => ({ ...item, contact_status: item.contact_status || 'locked' })));
      return;
    }

    setActionMessage('Unable to load talent search results.');
  }

  async function handleUnlockRequest(studentId: string) {
    setActionMessage('');
    const res = await postAuthJson<{ success: boolean; data: { status: string } }>(
      '/companies/talent/requests',
      { studentId },
    );

    if (res.ok && res.body?.success) {
      setTalent(prev => prev.map(item => (
        item.id === studentId ? { ...item, contact_status: 'pending' } : item
      )));
      setActionMessage('Unlock request sent to coordinator.');
      return;
    }

    setActionMessage('Unable to request contact unlock.');
  }

  async function handleRecruiterAdd(e: React.FormEvent) {
    e.preventDefault();
    setActionMessage('');

    const res = await postAuthJson<{ success: boolean; data: Recruiter[] }>(
      '/companies/me/recruiters',
      recruiterForm,
    );

    if (res.ok && res.body?.success) {
      setRecruiters(res.body.data || []);
      setRecruiterForm({ name: '', email: '', phone: '', title: '' });
      setActionMessage('Recruiter added successfully.');
      return;
    }

    setActionMessage('Unable to add recruiter.');
  }

  const volumePoints = useMemo(() => {
    if (!analytics?.applicationVolume?.length) return '';
    const data = analytics.applicationVolume;
    const max = Math.max(...data.map(item => item.count), 1);
    return data.map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * 360;
      const y = 120 - (item.count / max) * 100;
      return `${x},${y}`;
    }).join(' ');
  }, [analytics]);

  if (isLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Company dashboard unavailable</h2>
        <p style={{ color: 'var(--color-muted)' }}>{error}</p>
      </div>
    );
  }

  return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 0 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: approvalBadge.bg, color: approvalBadge.color, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {approvalBadge.label}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 800, margin: '0.75rem 0 0.3rem' }}>
              <Link href="/dashboard/company/profile" style={{ color: '#111827', textDecoration: 'none' }}>
                {profile?.company_name || 'Company'}
              </Link>{' '}
              Dashboard
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '1rem', margin: 0 }}>
              Monitor postings, approvals, and talent pipeline health in one place.
            </p>
          </div>
          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(34,151,250,0.12)' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>Primary Contact</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{profile?.primary_contact?.name || 'Not set'}</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>{profile?.primary_contact?.email || 'No email'}</p>
          </div>
        </div>

        {showProfilePrompt && (
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(129,140,248,0.08))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 18, padding: '18px 22px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', marginBottom: 4 }}>Finish your company profile</strong>
              <span style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>Add legal name, industry, size, website, and contact details to unlock approvals and postings.</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => router.push('/dashboard/company/profile')}
                style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 700 }}
              >
                Complete now
              </button>
              <button
                type="button"
                onClick={handleSkipProfilePrompt}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(30,64,175,0.4)', background: '#fff', color: '#1e3a8a', fontWeight: 700 }}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Status banner */}
        {metrics?.approvalStatus !== 'approved' && (
          <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 18, padding: '18px 22px', marginBottom: '2rem' }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: 4 }}>Coordinator approval required</strong>
            <span style={{ color: '#92400e', fontSize: '0.9rem' }}>Your registration is under review. Posting internships will be enabled after approval.</span>
          </div>
        )}

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Active Postings', value: metrics?.activePostings ?? 0 },
            { label: 'Total Applications', value: metrics?.totalApplications ?? 0 },
            { label: 'Shortlisted Candidates', value: metrics?.shortlistedCandidates ?? 0 },
            { label: 'Offer Conversion Rate', value: `${metrics?.offerConversionRate ?? 0}%` },
            { label: 'Pending Actions', value: metrics?.pendingActions ?? 0 },
          ].map(card => (
            <div key={card.label} style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 8px 20px rgba(15,23,42,0.06)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{card.label}</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{card.value}</h3>
            </div>
          ))}
        </div>

        {/* Profile + Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #2297FA 0%, #8082D6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>
                {profile?.company_name?.[0] || 'C'}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{profile?.legal_name || profile?.company_name}</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{profile?.industry || 'Industry'}</p>
              </div>
            </div>
            <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 18 }}>
              {profile?.description || 'Add a strong company description to attract the right talent and showcase your culture.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
              <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>Company Size</p>
                <strong>{profile?.size || '-'}</strong>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>Website</p>
                <a href={profile?.website} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>{profile?.website || 'Add link'}</a>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {(profile?.office_locations || []).slice(0, 2).map((office, index) => (
                <div key={`${office.city}-${index}`} style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>{office.label || 'Office'}</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{office.city}, {office.country}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{office.address_line1}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Applications Over Time</h3>
              <svg width="100%" height="140" viewBox="0 0 360 140" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#2297FA" />
                    <stop offset="100%" stopColor="#8082D6" />
                  </linearGradient>
                </defs>
                <polyline points={volumePoints} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Source of Hire</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {(analytics?.sourceBreakdown || []).slice(0, 4).map(source => (
                  <div key={source.source} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{source.source}</span>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{source.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Average time to offer</p>
                <strong style={{ fontSize: '1.1rem' }}>{analytics?.averageTimeToOfferDays ?? 0} days</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Recruiters + Talent */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.15rem', fontWeight: 700 }}>Recruiter Team</h3>
            <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
              {recruiters.length === 0 && (
                <p style={{ color: '#94a3b8', margin: 0 }}>Add recruiters to collaborate on hiring.</p>
              )}
              {recruiters.map(rec => (
                <div key={rec._id || rec.email} style={{ padding: 12, borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <strong>{rec.name}</strong>
                  <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.85rem' }}>{rec.title || 'Recruiter'} · {rec.email}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleRecruiterAdd} style={{ display: 'grid', gap: 10 }}>
              <input
                placeholder="Full name"
                value={recruiterForm.name}
                onChange={e => setRecruiterForm(prev => ({ ...prev, name: e.target.value }))}
                required
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <input
                placeholder="Email"
                type="email"
                value={recruiterForm.email}
                onChange={e => setRecruiterForm(prev => ({ ...prev, email: e.target.value }))}
                required
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <input
                placeholder="Title"
                value={recruiterForm.title}
                onChange={e => setRecruiterForm(prev => ({ ...prev, title: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <button type="submit" style={{ padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #2297FA 0%, #8082D6 100%)', color: '#fff', fontWeight: 700 }}>
                Add recruiter
              </button>
            </form>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.15rem', fontWeight: 700 }}>Talent Search</h3>
            <form onSubmit={handleTalentSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
              <input
                placeholder="Skill"
                value={searchFilters.skill}
                onChange={e => setSearchFilters(prev => ({ ...prev, skill: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <input
                placeholder="Branch"
                value={searchFilters.branch}
                onChange={e => setSearchFilters(prev => ({ ...prev, branch: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <input
                placeholder="Min CGPA"
                value={searchFilters.minCgpa}
                onChange={e => setSearchFilters(prev => ({ ...prev, minCgpa: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <input
                placeholder="Grad Year"
                value={searchFilters.graduationYear}
                onChange={e => setSearchFilters(prev => ({ ...prev, graduationYear: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <button type="submit" style={{ padding: '12px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700 }}>
                Search
              </button>
            </form>

            {actionMessage && (
              <p style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', marginBottom: 12 }}>{actionMessage}</p>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              {talent.length === 0 && (
                <p style={{ color: '#94a3b8', margin: 0 }}>Use filters above to discover eligible students.</p>
              )}
              {talent.map(student => (
                <div key={student.id} style={{ padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
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
                        <button
                          type="button"
                          onClick={() => handleUnlockRequest(student.id)}
                          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5f5', background: '#eef2ff', color: '#3730a3', fontWeight: 700 }}
                        >
                          Request contact
                        </button>
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
        </div>
      </div>
  );
}
