'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiDashboardLine,
  RiUserLine,
  RiShieldUserLine,
  RiFileList3Line,
  RiBriefcaseLine,
  RiSettings4Line,
} from 'react-icons/ri';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: RiDashboardLine, href: '/dashboard/rbac' },
  { label: 'Users', icon: RiUserLine, href: '/dashboard/rbac/users' },
  { label: 'Roles & Permissions', icon: RiShieldUserLine, href: '/dashboard/rbac/roles' },
  { label: 'Applications', icon: RiFileList3Line, href: '/dashboard/rbac/applications' },
  { label: 'Internships', icon: RiBriefcaseLine, href: '/dashboard/rbac/internships' },
  { label: 'Settings', icon: RiSettings4Line, href: '/dashboard/rbac/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 flex flex-col transition-transform duration-300',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <RiShieldUserLine className="text-white text-lg" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight">
            RBAC Console
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'text-lg shrink-0',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-600 px-3">
            Internship Portal v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
