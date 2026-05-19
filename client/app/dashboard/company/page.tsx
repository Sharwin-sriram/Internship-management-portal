'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getJson } from '../../../lib/api';

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


interface DashboardMetrics {
  activePostings: number;
  totalApplications: number;
  shortlistedCandidates: number;
  offerConversionRate: number;
  pendingActions: number;
  approvalStatus: string;
  recommendedInterns?: {
    id: string;
    name: string;
    branch: string;
    cgpa: number;
    skills: string[];
    graduationYear: number;
  }[];
}

interface AnalyticsData {
  applicationVolume: { date: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  averageTimeToOfferDays: number;
}

const interviewQuickLinks = [
  {
    href: '/dashboard/company/interviews/schedule',
    label: 'Schedule Interviews',
    desc: 'Book interviews with candidates — date, time, type, and meeting link',
    icon: '📅',
  },
  {
    href: '/dashboard/company/calendar',
    label: 'Interview Calendar',
    desc: 'Month and week views, filters, and Google Calendar sync',
    icon: '🗓️',
  },
];


export default function CompanyDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

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

      const [profileRes, metricsRes, analyticsRes] = await Promise.all([
        getJson<{ success: boolean; data: CompanyProfile }>('/companies/me'),
        getJson<{ success: boolean; data: DashboardMetrics }>('/companies/me/dashboard'),
        getJson<{ success: boolean; data: AnalyticsData }>('/companies/me/analytics'),
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 0 2rem' }}>
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

        {/* Interview quick actions */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>Interviews</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {interviewQuickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  background: '#fff',
                  borderRadius: 18,
                  padding: '20px 22px',
                  border: '1px solid rgba(148,174,254,0.25)',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(15,23,42,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(148,174,254,0.25)';
                }}
              >
                <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: 10 }}>{link.icon}</span>
                <strong style={{ display: 'block', fontSize: '1.05rem', color: '#0f172a', marginBottom: 6 }}>{link.label}</strong>
                <span style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>{link.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Status banner */}
        {metrics?.approvalStatus !== 'approved' && (
          <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 18, padding: '18px 22px', marginBottom: '2rem' }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: 4 }}>Coordinator approval required</strong>
            <span style={{ color: '#92400e', fontSize: '0.9rem' }}>Your registration is under review. Posting internships will be enabled after approval.</span>
          </div>
        )}


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

        {/* Recommended Interns */}
        {metrics?.recommendedInterns && metrics.recommendedInterns.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recommended Interns</h2>
              <Link href="/dashboard/company/talent" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                Search Talent Pool →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {metrics.recommendedInterns.map((intern) => (
                <div 
                  key={intern.id} 
                  style={{ 
                    background: '#fff', 
                    borderRadius: 18, 
                    padding: 20, 
                    border: '1px solid rgba(148,174,254,0.25)', 
                    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(15,23,42,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.04)';
                  }}
                  onClick={() => router.push('/dashboard/company/talent')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--color-primary-10)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                        {intern.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '1rem', color: '#0f172a' }}>{intern.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{intern.branch} · CGPA {intern.cgpa}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {intern.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} style={{ padding: '4px 8px', borderRadius: 999, background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                          {skill}
                        </span>
                      ))}
                      {intern.skills.length > 3 && (
                        <span style={{ padding: '4px 8px', borderRadius: 999, background: '#f1f5f9', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600 }}>
                          +{intern.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Graduating: {intern.graduationYear}</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Unlock Profile
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
  );
}
