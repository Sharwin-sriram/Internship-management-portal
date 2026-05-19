'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getJson } from '../../../../lib/api';

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

export default function CompanyAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && user.role !== 'company') router.push('/dashboard');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'company') return;
    const load = async () => {
      setLoading(true);
      const [metricsRes, analyticsRes] = await Promise.all([
        getJson<{ success: boolean; data: DashboardMetrics }>('/companies/me/dashboard'),
        getJson<{ success: boolean; data: AnalyticsData }>('/companies/me/analytics'),
      ]);

      if (metricsRes.ok && metricsRes.body?.success) setMetrics(metricsRes.body.data);
      if (analyticsRes.ok && analyticsRes.body?.success) setAnalytics(analyticsRes.body.data);
      setLoading(false);
    };

    load();
  }, [user]);

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

  if (loading || isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 0 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, marginBottom: 6 }}>Analytics</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Track application trends and conversion efficiency.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Active Postings', value: metrics?.activePostings ?? 0 },
          { label: 'Total Applications', value: metrics?.totalApplications ?? 0 },
          { label: 'Shortlisted Candidates', value: metrics?.shortlistedCandidates ?? 0 },
          { label: 'Offer Conversion Rate', value: `${metrics?.offerConversionRate ?? 0}%` },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 8px 20px rgba(15,23,42,0.06)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{card.label}</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{card.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Applications Over Time</h3>
          <svg width="100%" height="140" viewBox="0 0 360 140" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="lineGradientAnalytics" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#2297FA" />
                <stop offset="100%" stopColor="#8082D6" />
              </linearGradient>
            </defs>
            <polyline points={volumePoints} fill="none" stroke="url(#lineGradientAnalytics)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(148,174,254,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Source of Hire</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {(analytics?.sourceBreakdown || []).slice(0, 6).map(source => (
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
  );
}
