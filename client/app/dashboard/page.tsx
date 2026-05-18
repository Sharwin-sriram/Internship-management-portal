'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '../../components/ui/Button';

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  student:     { label: 'Student',     color: '#2297FA', bg: 'rgba(34,151,250,0.1)' },
  company:     { label: 'Company',     color: '#8082D6', bg: 'rgba(128,130,214,0.1)' },
  admin:       { label: 'Admin',       color: '#50B6FE', bg: 'rgba(80,182,254,0.1)' },
  coordinator: { label: 'Coordinator', color: '#94AEFE', bg: 'rgba(148,174,254,0.1)' },
};

const quickLinks = [
  { label: 'Browse Internships', icon: '🔍', desc: 'Explore all open internship listings' },
  { label: 'My Applications',    icon: '📋', desc: 'Track the status of your applications' },
  { label: 'Documents',          icon: '📄', desc: 'Upload and manage your documents' },
  { label: 'Notifications',      icon: '🔔', desc: 'View your recent alerts and updates' },
];

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user?.role === 'company') {
      router.push('/dashboard/company');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role === 'company') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const meta = roleMeta[user.role] ?? roleMeta.student;

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      {/* Welcome header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: meta.bg, border: `1px solid ${meta.color}30`, marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: meta.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{meta.label}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-xs)' }}>
            Welcome back, {user.name || 'there'} 👋
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-base)' }}>
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} id="dashboard-logout">
          Sign out
        </Button>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        {quickLinks.map((q, i) => (
          <div
            key={q.label}
            id={`dashboard-card-${i}`}
            style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'transform var(--transition-base), box-shadow var(--transition-base)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='var(--shadow-md)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow='var(--shadow-sm)'; }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>{q.icon}</div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 4 }}>{q.label}</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>{q.desc}</p>
          </div>
        ))}
      </div>

      {/* Coming soon banner */}
      <div style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', border: '1px solid var(--color-primary-20)', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 'var(--font-size-lg)' }}>Full dashboard coming soon</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
            We&apos;re building out detailed analytics, application management, and company tools. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
