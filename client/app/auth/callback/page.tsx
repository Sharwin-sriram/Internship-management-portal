'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { saveAuth, type AuthUser } from '../../../lib/auth';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You cancelled sign-in or denied access.',
  authentication_failed: 'Authentication failed. Please try again.',
  invalid_state: 'Invalid or expired sign-in session. Please try again.',
  server_error: 'A server error occurred during sign-in. Please try again.',
};

function dashboardPath(role: AuthUser['role']): string {
  if (role === 'company') return '/dashboard/company';
  if (role === 'admin') return '/dashboard/admin';
  return '/dashboard';
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('Completing sign-in…');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setMessage(ERROR_MESSAGES[error] ?? 'Sign-in failed. Please try again.');
      setIsError(true);
      return;
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setMessage('Sign-in session not found. Please try again.');
      setIsError(true);
      return;
    }

    if (!session) return;
    const backendToken = (session as any).backendToken as string | undefined;
    const backendUser = (session as any).backendUser as AuthUser | undefined;

    if (!backendToken || !backendUser) {
      setMessage('Could not complete sign-in. Backend session missing.');
      setIsError(true);
      return;
    }

    const authUser: AuthUser = {
      id: String((backendUser as any).id ?? (backendUser as any)._id ?? ''),
      name: backendUser.name,
      email: backendUser.email,
      role: backendUser.role,
      avatar: (backendUser as any).avatar,
      token: backendToken,
    };

    saveAuth(authUser);
    router.replace(dashboardPath(authUser.role));
  }, [router, session, status]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #f7f9fc 50%, #eef6ff 100%)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 40,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        }}
      >
        {!isError && <Spinner />}
        <p style={{ margin: '16px 0', color: '#374151', lineHeight: 1.5 }}>{message}</p>
        {isError && (
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              marginTop: 16,
              color: '#4285F4',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        border: '3px solid #e5e7eb',
        borderTopColor: '#4285F4',
        borderRadius: '50%',
        margin: '0 auto',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}
