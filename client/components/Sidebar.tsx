'use client';

import React from 'react';
import Link from 'next/link';

export default function Sidebar({ active, onSelect }:{ active:string; onSelect:(s:string)=>void }){
  const items = [
    { key: 'profile', label: 'Profile' },
    { key: 'account', label: 'Account' },
    { key: 'security', label: 'Security' },
    { key: 'notifications', label: 'Notifications' },
  ];

  return (
    <aside style={{ width: 260, minWidth: 220 }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: 14, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="Settings navigation">
          {items.map(it => (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: active === it.key ? 'var(--color-primary-10)' : 'transparent',
                color: active === it.key ? 'var(--color-primary)' : 'var(--color-foreground)',
                fontWeight: active === it.key ? 700 : 600,
                cursor: 'pointer',
              }}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
