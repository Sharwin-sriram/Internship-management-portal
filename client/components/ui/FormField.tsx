'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  children: React.ReactElement;
}

export function FormField({ label, id, error, hint, children }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 600,
          color: 'var(--color-foreground)',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </label>
      {React.cloneElement(children, { id } as React.HTMLAttributes<HTMLElement>)}
      {hint && !error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
          {hint}
        </span>
      )}
      {error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ hasError, style, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        border: `1.5px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-foreground)',
        background: 'var(--color-surface)',
        outline: 'none',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = hasError
          ? 'var(--color-error)'
          : 'var(--color-border)';
        e.currentTarget.style.boxShadow = 'none';
        rest.onBlur?.(e);
      }}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  children: React.ReactNode;
}

export function Select({ hasError, style, children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        border: `1.5px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-foreground)',
        background: 'var(--color-surface)',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-10)';
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.boxShadow = 'none';
        rest.onBlur?.(e);
      }}
    >
      {children}
    </select>
  );
}
