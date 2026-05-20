'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { postAuthJson } from '@/lib/api';
import Button from '@/components/ui/Button';
import {
  FiArrowLeft,
  FiBriefcase,
  FiAlignLeft,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

export default function CreateInternshipPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stipendMin, setStipendMin] = useState('');
  const [stipendMax, setStipendMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [batchId, setBatchId] = useState('');
  const [status, setStatus] = useState<'open' | 'draft' | 'closed'>('open');

  // Page States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'company' && user.role !== 'admin' && user.role !== 'coordinator') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    // Validations
    if (!title.trim() || !description.trim() || !stipendMin || !stipendMax || !deadline || !batchId.trim()) {
      setSubmitError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const min = Number(stipendMin);
    const max = Number(stipendMax);

    if (isNaN(min) || min < 0) {
      setSubmitError('Minimum stipend must be a valid positive number.');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(max) || max < 0) {
      setSubmitError('Maximum stipend must be a valid positive number.');
      setIsSubmitting(false);
      return;
    }

    if (min > max) {
      setSubmitError('Minimum stipend cannot exceed maximum stipend.');
      setIsSubmitting(false);
      return;
    }

    const selectedDeadline = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDeadline < today) {
      setSubmitError('Deadline cannot be in the past.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await postAuthJson<{ success: boolean; message?: string }>('/internships', {
        title: title.trim(),
        description: description.trim(),
        stipend_min: min,
        stipend_max: max,
        deadline: selectedDeadline.toISOString(),
        batch_id: batchId.trim(),
        status,
      });

      if (res.ok && res.body?.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.body?.message || 'Failed to submit posting. Please check your inputs and try again.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid var(--color-primary)',
          borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite'
        }} />
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          maxWidth: 520,
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.12)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            animation: 'pulse-ring 2s infinite'
          }}>
            <FiCheckCircle size={44} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
            Internship Posted!
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Your internship posting <strong>{title}</strong> has been successfully created and is now active for applications.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button variant="ghost" onClick={() => router.push('/dashboard/company')}>
              Go to Dashboard
            </Button>
            <Button variant="primary" onClick={() => {
              // Reset state to post another
              setTitle('');
              setDescription('');
              setStipendMin('');
              setStipendMax('');
              setDeadline('');
              setBatchId('');
              setStatus('open');
              setSubmitSuccess(false);
            }}>
              Post Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/company')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--color-muted)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          padding: 0
        }}
      >
        <FiArrowLeft /> Back to Dashboard
      </button>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#0f172a' }}>
          Post a New Internship
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>
          Create a new internship listing to attract qualified student candidates.
        </p>
      </div>

      {/* Error display */}
      {submitError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--color-error)',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <FiAlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Glassmorphic Form Card */}
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Section 1: Basic Information */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <FiBriefcase size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Role Details</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                Internship Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="e.g. Frontend Developer Intern"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                Role Description *
              </label>
              <div style={{ position: 'relative' }}>
                <FiAlignLeft style={{ position: 'absolute', left: 16, top: 16, color: 'var(--color-subtle)' }} />
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows={6}
                  placeholder="Describe the responsibilities, project scope, skills required, and qualifications..."
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Compensation & Requirements */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <FiDollarSign size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Compensation & Targets</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                Minimum Stipend (per month) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)', fontWeight: 600 }}>$</span>
                <input
                  type="number"
                  min="0"
                  value={stipendMin}
                  onChange={e => setStipendMin(e.target.value)}
                  required
                  placeholder="e.g. 500"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 32px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                Maximum Stipend (per month) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)', fontWeight: 600 }}>$</span>
                <input
                  type="number"
                  min="0"
                  value={stipendMax}
                  onChange={e => setStipendMax(e.target.value)}
                  required
                  placeholder="e.g. 1500"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 32px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                Target Batch / Batch ID *
              </label>
              <div style={{ position: 'relative' }}>
                <FiUsers style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)' }} />
                <input
                  type="text"
                  value={batchId}
                  onChange={e => setBatchId(e.target.value)}
                  required
                  placeholder="e.g. 2026 Batch"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                Application Status *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="open">Active (Open to Applications)</option>
                <option value="draft">Draft (Private Save)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                Application Deadline *
              </label>
              <div style={{ position: 'relative' }}>
                <FiCalendar style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)' }} />
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: '1.5rem',
          marginTop: '1rem'
        }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/dashboard/company')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            Post Internship
          </Button>
        </div>
      </form>
    </div>
  );
}
