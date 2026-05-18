'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AuthCard from '../../components/ui/AuthCard';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your InternHub account to continue."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <FormField label="Email address" id="login-email">
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </FormField>

        <FormField label="Password" id="login-password">
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </FormField>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          id="login-submit"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
