'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const LOCK_UNTIL_KEY = 'login_lock_until';
const ATTEMPTS_KEY = 'login_attempts';

/* ─── SVG Icons ─────────────────────────────────────────────── */
function LockIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'company'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isLocked = locked || attempts >= MAX_ATTEMPTS;
  const remainingAttempts = MAX_ATTEMPTS - attempts;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedAttempts = localStorage.getItem(ATTEMPTS_KEY);
    if (storedAttempts) {
      const parsedAttempts = Number(storedAttempts);
      if (!Number.isNaN(parsedAttempts)) {
        setAttempts(parsedAttempts);
      }
    }

    const storedUntil = localStorage.getItem(LOCK_UNTIL_KEY);
    if (storedUntil) {
      const lockUntil = Number(storedUntil);
      if (!Number.isNaN(lockUntil) && Date.now() < lockUntil) {
        setLocked(true);
        setAttempts(MAX_ATTEMPTS);
      } else {
        localStorage.removeItem(LOCK_UNTIL_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));

    if (locked || attempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION_MINUTES * 60 * 1000;
      localStorage.setItem(LOCK_UNTIL_KEY, String(lockUntil));
    } else {
      localStorage.removeItem(LOCK_UNTIL_KEY);
    }
  }, [attempts, locked]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    setLoading(true);

    const err = await login(username, password, loginRole);
    setLoading(false);

    if (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setError('');
      } else {
        setError(err);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCK_UNTIL_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      }
      setAttempts(0);
      setLocked(false);
      router.push('/dashboard');
    }
  }

  function handleUnlockEmail() {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  }

  function handleUnlockAdmin() {
    alert('A support request has been sent to the administrator. You will be contacted shortly.');
  }

  /* ─── Inline Styles ──────────────────────────────────────── */
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #f7f9fc 50%, #eef6ff 100%)',
    position: 'relative',
    overflow: 'hidden',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 460,
    background: '#ffffff',
    borderRadius: 24,
    padding: '2.5rem',
    boxShadow: isLocked
      ? '0 20px 60px rgba(239,68,68,0.18), 0 4px 12px rgba(0,0,0,0.08)'
      : '0 20px 60px rgba(34,151,250,0.14), 0 4px 12px rgba(0,0,0,0.08)',
    border: isLocked ? '1.5px solid rgba(239,68,68,0.25)' : '1.5px solid rgba(34,151,250,0.12)',
    transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
    position: 'relative',
    animation: 'cardEntrance 0.6s cubic-bezier(0.22,1,0.36,1) both',
  };

  const inputWrapperStyle = (fieldId: string, hasError?: boolean): React.CSSProperties => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: `1.5px solid ${
      hasError ? 'rgba(239,68,68,0.6)'
      : focusedField === fieldId ? 'var(--color-primary)'
      : 'var(--color-border)'
    }`,
    borderRadius: 10,
    background: isLocked ? '#fafafa' : '#fff',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: focusedField === fieldId && !isLocked
      ? '0 0 0 3px rgba(34,151,250,0.12)'
      : hasError ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '13px 16px 13px 44px',
    fontSize: '0.9375rem',
    fontFamily: 'var(--font-sans)',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: isLocked ? '#9ca3af' : 'var(--color-foreground)',
    borderRadius: 10,
    cursor: isLocked ? 'not-allowed' : 'text',
  };

  const iconInInputStyle: React.CSSProperties = {
    position: 'absolute',
    left: 14,
    color: isLocked ? '#d1d5db' : '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    transition: 'color 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
    letterSpacing: '0.01em',
  };

  const roleButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 14px',
    borderRadius: 10,
    border: active ? '1.5px solid rgba(34,151,250,0.65)' : '1.5px solid var(--color-border)',
    background: active ? 'rgba(34,151,250,0.08)' : '#fff',
    color: active ? 'var(--color-primary)' : '#6b7280',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <>
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lockShake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-6px); }
          80%     { transform: translateX(6px); }
        }
        @keyframes lockBounce {
          0%,100% { transform: scale(1); }
          30%     { transform: scale(1.15); }
          60%     { transform: scale(0.95); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-red {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%     { box-shadow: 0 0 0 8px rgba(239,68,68,0.12); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatBg {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-20px) rotate(5deg); }
        }
        .locked-card { animation: pulse-red 2.5s ease infinite !important; }
        .lock-icon-anim { animation: lockBounce 0.5s ease; }
        .shake { animation: lockShake 0.4s ease; }
        .attempt-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(239,68,68,0.1); color: #dc2626;
          font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em;
        }
        .unlock-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 12px 20px;
          border-radius: 10px; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s ease;
          font-family: var(--font-sans);
        }
        .unlock-btn:hover { transform: translateY(-1px); }
        .unlock-btn-email {
          background: #fff; color: #dc2626;
          border: 1.5px solid rgba(239,68,68,0.4);
          box-shadow: 0 2px 8px rgba(239,68,68,0.1);
        }
        .unlock-btn-email:hover {
          background: rgba(239,68,68,0.04);
          box-shadow: 0 4px 14px rgba(239,68,68,0.18);
          border-color: rgba(239,68,68,0.6);
        }
        .unlock-btn-admin {
          background: #fff; color: #374151;
          border: 1.5px solid #e4eaf3;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .unlock-btn-admin:hover {
          background: #f9fafb;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        }
        .success-toast {
          animation: fadeSlideDown 0.35s ease both;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 10px;
          background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25);
          color: #15803d; font-size: 0.875rem; font-weight: 500;
        }
        .warning-pulse {
          animation: fadeSlideDown 0.35s ease both;
        }
        .bg-orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none; z-index: 0;
          animation: floatBg 8s ease-in-out infinite;
        }
        .submit-btn {
          width: 100%; padding: 14px 24px;
          font-size: 1rem; font-weight: 700;
          border-radius: 10px; cursor: pointer;
          font-family: var(--font-sans); letter-spacing: 0.02em;
          transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background-color: transparent;
          color: #2297FA;
          border: 2px solid #2297FA;
        }
        .submit-btn:not(:disabled):hover {
          background-color: #2297FA;
          border-color: #2297FA;
          color: #fff;
        }
        .submit-btn:disabled {
          cursor: not-allowed; opacity: 0.6;
        }
        .submit-btn.is-loading {
          background-color: #2297FA;
          border-color: #2297FA;
          color: #fff;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer;
          padding: 8px 12px; color: #9ca3af;
          display: flex; align-items: center;
          transition: color 0.2s ease;
        }
        .eye-btn:hover { color: #6b7280; }
        .security-badge {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 20px;
          font-size: 0.75rem; color: #9ca3af; font-weight: 500;
        }
      `}</style>

      <div style={pageStyle}>
        {/* Background orbs */}
        <div className="bg-orb" style={{
          width: 320, height: 320, top: -80, right: -80,
          background: isLocked
            ? 'rgba(239,68,68,0.08)'
            : 'rgba(34,151,250,0.10)',
        }} />
        <div className="bg-orb" style={{
          width: 240, height: 240, bottom: -60, left: -60,
          background: 'rgba(128,130,214,0.08)',
          animationDelay: '4s',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
          {/* ─── Card ────────────────────────────────────── */}
          <div style={cardStyle} className={isLocked ? 'locked-card' : ''}>

            {/* Logo / Lock icon — hidden when locked */}
            {!isLocked && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: 'linear-gradient(135deg, #2297FA 0%, #8082D6 100%)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(34,151,250,0.35)',
                }}>
                  <LockIcon size={28} color="#fff" />
                </div>
              </div>
            )}

            {/* Title */}
            <h1 style={{
              textAlign: 'center', margin: '0 0 6px',
              fontSize: '1.625rem', fontWeight: 800,
              color: isLocked ? '#dc2626' : 'var(--color-foreground)',
              transition: 'color 0.4s ease',
            }}>
              {isLocked ? 'Account Locked' : 'Welcome back'}
            </h1>
            <p style={{
              textAlign: 'center', margin: '0 0 28px',
              fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5,
            }}>
              {isLocked
                ? 'Your account has been temporarily suspended.'
                : 'Sign in to your InternHub account to continue.'}
            </p>

            {/* ─── LOCKED STATE ───────────────────────────── */}
            {isLocked ? (
              <div style={{ animation: 'fadeSlideDown 0.4s ease both' }}>
                {/* Lock banner */}
                <div style={{
                  padding: '20px 22px', borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(185,28,28,0.07) 100%)',
                  border: '2px solid rgba(239,68,68,0.35)',
                  marginBottom: 24, textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.12)',
                }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '4px 14px', borderRadius: 20,
                    background: 'rgba(239,68,68,0.12)',
                    marginBottom: 12,
                  }}>
                    <span style={{ fontSize: '1rem' }}>🔒</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#dc2626',
                    }}>Security Alert</span>
                  </div>
                  <p style={{
                    margin: '0 0 6px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#b91c1c',
                    lineHeight: 1.5,
                    letterSpacing: '-0.01em',
                  }}>
                    Your account has been locked due to multiple failed login attempts.
                  </p>
                  <p style={{
                    margin: '8px 0 0', fontSize: '0.8125rem',
                    color: '#dc2626', lineHeight: 1.55, fontWeight: 500,
                  }}>
                    {MAX_ATTEMPTS} consecutive failed logins detected. Use the options below to regain access.
                  </p>
                </div>



                {/* Divider */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
                }}>
                  <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>
                    Recovery Options
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                </div>

                {/* Unlock buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    id="unlock-email-btn"
                    className="unlock-btn unlock-btn-email"
                    onClick={handleUnlockEmail}
                  >
                    <MailIcon />
                    Unlock via Email
                  </button>
                  <button
                    id="contact-admin-btn"
                    className="unlock-btn unlock-btn-admin"
                    onClick={handleUnlockAdmin}
                  >
                    <SupportIcon />
                    Contact Admin
                  </button>
                </div>

                {/* Success toast */}
                {emailSent && (
                  <div className="success-toast" style={{ marginTop: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Unlock link sent! Check your inbox.
                  </div>
                )}
              </div>

            ) : (
              /* ─── NORMAL LOGIN FORM ───────────────────────── */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                {/* Attempts warning */}
                {attempts > 0 && attempts < MAX_ATTEMPTS && (
                  <div className="warning-pulse" style={{
                    marginBottom: 20, padding: '10px 14px',
                    borderRadius: 10, background: 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.8125rem', color: '#b91c1c', fontWeight: 500 }}>
                      Incorrect credentials
                    </span>
                    <span className="attempt-badge">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} left
                    </span>
                  </div>
                )}

                {/* Username field */}
                  {/* Role selector */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Login as</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setLoginRole('student')}
                        style={roleButtonStyle(loginRole === 'student')}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginRole('company')}
                        style={roleButtonStyle(loginRole === 'company')}
                      >
                        Company
                      </button>
                    </div>
                  </div>

                  {/* Email field */}
                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="login-username" style={labelStyle}>Email</label>
                  <div style={inputWrapperStyle('username', attempts > 0)}>
                    <span style={iconInInputStyle}><UserIcon /></span>
                    <input
                      id="login-username"
                        type="email"
                        placeholder="Enter your email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      required
                        autoComplete="email"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 8,
                  }}>
                    <label htmlFor="login-password" style={{ ...labelStyle, margin: 0 }}>Password</label>
                    <a href="#" style={{
                      fontSize: '0.8rem', color: 'var(--color-primary)',
                      fontWeight: 500, textDecoration: 'none',
                    }}>
                      Forgot password?
                    </a>
                  </div>
                  <div style={inputWrapperStyle('password', attempts > 0)}>
                    <span style={iconInInputStyle}><LockIcon size={18} /></span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="current-password"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Generic error */}
                {error && (
                  <div style={{
                    marginBottom: 20, padding: '11px 14px',
                    borderRadius: 10, background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.22)',
                    color: '#dc2626', fontSize: '0.875rem', fontWeight: 500,
                    animation: 'fadeSlideDown 0.3s ease both',
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading || isLocked}
                  className={`submit-btn${loading ? ' is-loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        animation: 'spin 0.7s linear infinite',
                        display: 'inline-block',
                      }} />
                      Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                {/* Footer link */}
                <p style={{
                  textAlign: 'center', marginTop: 20,
                  fontSize: '0.875rem', color: '#6b7280',
                }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" style={{
                    color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none',
                  }}>
                    Create one free
                  </Link>
                </p>
              </form>
            )}

            {/* Security badge */}
            <div className="security-badge">
              <ShieldIcon />
              <span>256-bit SSL encrypted · Secured by InternHub</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
