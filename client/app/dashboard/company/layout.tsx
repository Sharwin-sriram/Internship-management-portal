import React from 'react';
import CompanySidebar from '../../../components/company/CompanySidebar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #eef3ff 0%, #f9fafc 40%, #f2f7ff 100%)' }}>
      <div style={{ display: 'flex', gap: '1.5rem', maxWidth: 1450, margin: '0 auto', padding: '1.5rem 0.5rem 4rem' }}>
        <CompanySidebar />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
