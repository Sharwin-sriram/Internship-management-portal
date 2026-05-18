'use client';

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--gradient-brand)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(34,151,250,0.35)',
  },
  secondary: {
    background: 'var(--color-primary-10)',
    color: 'var(--color-primary)',
    border: '1.5px solid var(--color-primary-20)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-foreground)',
    border: '1.5px solid var(--color-border)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-error)',
    border: '1.5px solid var(--color-error)',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: 'var(--font-size-sm)' },
  md: { padding: '10px 20px', fontSize: 'var(--font-size-base)' },
  lg: { padding: '13px 28px', fontSize: 'var(--font-size-lg)' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: 'var(--radius)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.65 : 1,
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast)',
        width: fullWidth ? '100%' : undefined,
        letterSpacing: '0.01em',
        fontFamily: 'var(--font-sans)',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          if (variant === 'primary') {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 6px 20px rgba(34,151,250,0.45)';
          }
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        if (variant === 'primary') {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 14px rgba(34,151,250,0.35)';
        }
      }}
    >
      {loading && (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </button>
  );
}
