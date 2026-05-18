'use client';

import { useState } from 'react';
import DashboardSidebar from './Sidebar';
import DashboardTopbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    role: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} user={user} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
