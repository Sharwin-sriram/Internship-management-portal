'use client';

import React from 'react';
import Link from 'next/link';
import AuthCard from '../../../components/ui/AuthCard';
import Button from '../../../components/ui/Button';

export default function RegisterSuccess(){
  return (
    <AuthCard title="Welcome to InternHub" subtitle="Your account has been created successfully.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <p style={{ margin: 0, color: 'var(--color-muted)', textAlign: 'center' }}>
          Thanks for creating an account. You can sign in to access the student dashboard, complete your profile, and start applying for internships.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <Link href="/login">
            <Button variant="primary">Sign in</Button>
          </Link>

          <Link href="/">
            <Button variant="ghost">Go to homepage</Button>
          </Link>
        </div>

        <div style={{ marginTop: 8, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
          <div>If you created an account with a student email, check your inbox for a verification link.</div>
          <div style={{ marginTop: 6 }}>Need help? Contact support at support@example.com</div>
        </div>
      </div>
    </AuthCard>
  );
}
