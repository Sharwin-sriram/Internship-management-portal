'use client';

import React from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  maxWidth = 460,
}: AuthCardProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl) var(--space-md)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Logo mark */}
        <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(34,151,250,0.35)',
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <h1
          style={{
            margin: '0 0 6px',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-foreground)',
            textAlign: 'center',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              margin: '0 0 var(--space-xl)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-muted)',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
