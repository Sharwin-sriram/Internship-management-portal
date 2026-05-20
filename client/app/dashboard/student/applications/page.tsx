'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getJson } from '@/lib/api';
import Button from '@/components/ui/Button';
import { FiBriefcase, FiPlus, FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiBookOpen, FiFileText, FiMail, FiCalendar } from 'react-icons/fi';

interface JobApplicationData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cgpa: number;
  yearOfStudying: string;
  stream: string;
  department: string;
  skills: string[];
  resumeUrl: string;
  jobTitle?: string;
  status: 'applied' | 'pending' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected' | 'offer_issued';
  createdAt: string;
}

export default function StudentApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<JobApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchApplications = async () => {
        try {
          // Fetch from /api/job-applications using the client API helper
          const res = await getJson<{ success: boolean; data: JobApplicationData[] }>('/job-applications');
          if (res.ok && res.body?.success) {
            setApplications(res.body.data);
          }
        } catch (error) {
          console.error('Error fetching applications:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [user]);

  if (authLoading || !user || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const getStatusColor = (status: JobApplicationData['status']) => {
    switch (status) {
      case 'shortlisted': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
      case 'selected': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
      case 'interview_scheduled': return { color: '#2297FA', bg: 'rgba(34,151,250,0.1)' };
      case 'offer_issued': return { color: 'var(--color-primary)', bg: 'rgba(128,130,214,0.15)' };
      case 'reviewed': return { color: '#2297FA', bg: 'rgba(34,151,250,0.1)' };
      case 'applied':
      case 'pending': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
      case 'rejected': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      default: return { color: 'var(--color-muted)', bg: 'var(--color-border)' };
    }
  };

  const getStatusIcon = (status: JobApplicationData['status']) => {
    switch (status) {
      case 'shortlisted':
      case 'selected': return <FiCheckCircle style={{ marginRight: 4 }} />;
      case 'interview_scheduled': return <FiCalendar style={{ marginRight: 4 }} />;
      case 'offer_issued': return <FiMail style={{ marginRight: 4 }} />;
      case 'reviewed':
      case 'applied':
      case 'pending': return <FiClock style={{ marginRight: 4 }} />;
      case 'rejected': return <FiXCircle style={{ marginRight: 4 }} />;
      default: return <FiClock style={{ marginRight: 4 }} />;
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', 
              color: 'var(--color-muted)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 600,
              marginBottom: 'var(--space-sm)', padding: 0 
            }}
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--space-xs)' }}>
            My Applications
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-base)', fontWeight: 500 }}>
            Track the status of your internship applications.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => router.push('/explore')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <FiPlus /> Apply for Internship
        </Button>
      </header>

      {/* Main content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : applications.length > 0 ? (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>Role / Stream</th>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>Department</th>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>Year</th>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>CGPA</th>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>Applied Date</th>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>Resume</th>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>Status</th>
                  <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => {
                  const statusStyle = getStatusColor(app.status);
                  const formattedDate = new Date(app.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  });

                  return (
                    <tr 
                      key={app._id} 
                      style={{ 
                        borderBottom: index < applications.length - 1 ? '1px solid var(--color-border)' : 'none',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,151,250,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--color-primary-10)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          <FiBriefcase />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>{app.jobTitle || 'General Application'}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{app.stream} • {app.firstName} {app.lastName}</div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{app.department}</td>
                      <td style={{ padding: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>{app.yearOfStudying} Year</td>
                      <td style={{ padding: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{app.cgpa.toFixed(2)}</td>
                      <td style={{ padding: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>{formattedDate}</td>
                      <td style={{ padding: 'var(--space-lg)' }}>
                        <a 
                          href={`http://localhost:9933/${app.resumeUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}
                        >
                          <FiFileText /> View Resume
                        </a>
                      </td>
                      <td style={{ padding: 'var(--space-lg)' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 999, 
                          background: statusStyle.bg, color: statusStyle.color, fontSize: 'var(--font-size-xs)', 
                          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' 
                        }}>
                          {getStatusIcon(app.status)}
                          {app.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-lg)' }}>
                        <Button 
                          variant="ghost" 
                          onClick={() => router.push(`/dashboard/student/applications/track/${app._id}`)}
                          style={{ fontSize: 'var(--font-size-xs)', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          Track
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--color-surface)', border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-xl)', padding: 'var(--space-3xl) var(--space-xl)', textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ 
            width: 72, height: 72, borderRadius: '50%', background: 'var(--color-primary-10)', 
            color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto var(--space-lg)' 
          }}>
            <FiBookOpen size={32} />
          </div>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>No applications yet</h3>
          <p style={{ color: 'var(--color-muted)', maxWidth: 440, margin: '0 auto var(--space-xl)', lineHeight: 1.6 }}>
            You have not applied for any internships. Complete your profile and submit your first application today.
          </p>
          <Button 
            variant="primary" 
            onClick={() => router.push('/explore')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FiPlus /> Apply for Internship
          </Button>
        </div>
      )}
    </div>
  );
}
