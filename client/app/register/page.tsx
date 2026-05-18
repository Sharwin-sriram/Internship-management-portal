'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { postJson } from '../../lib/api';
import AuthCard from '../../components/ui/AuthCard';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';

type Role = 'student' | 'company';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const body: Record<string, string> = { role, email, password, name };
    if (role === 'company') body.companyName = companyName;

    const res = await postJson('/auth/register', body);
    setLoading(false);

    if (res.ok) {
      setSuccess('Account created! Redirecting to sign in…');
      setTimeout(() => router.push('/login'), 1800);
    } else {
      const b = res.body as { error?: string } | null;
      setError(b?.error ?? 'Registration failed. Please try again.');
    }
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Join InternHub as a student or company — it's completely free."
      maxWidth={500}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

        {/* Role toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 4, background: 'var(--color-background)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
          {(['student', 'company'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              id={`role-${r}`}
              onClick={() => setRole(r)}
              style={{
                padding: '10px',
                borderRadius: 'calc(var(--radius) - 4px)',
                border: 'none',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
                background: role === r ? 'var(--gradient-brand)' : 'transparent',
                color: role === r ? 'white' : 'var(--color-muted)',
                boxShadow: role === r ? '0 2px 8px rgba(34,151,250,0.3)' : 'none',
              }}
            >
              {r === 'student' ? '🎓 Student' : '🏢 Company'}
            </button>
          ))}
        </div>

        <FormField label={role === 'company' ? 'Contact Name' : 'Full Name'} id="reg-name">
          <Input id="reg-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        </FormField>

        {role === 'company' && (
          <FormField label="Company Name" id="reg-company">
            <Input id="reg-company" type="text" placeholder="Acme Corp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </FormField>
        )}

        <FormField label="Email address" id="reg-email">
          <Input id="reg-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </FormField>

        <FormField label="Password" id="reg-password" hint="At least 8 characters">
          <Input id="reg-password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </FormField>

        <FormField label="Confirm Password" id="reg-confirm">
          <Input id="reg-confirm" type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" hasError={!!error && error.includes('match')} />
        </FormField>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
            {success}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="register-submit" style={{ marginTop: 4 }}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', margin: 0 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
