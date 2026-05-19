'use client';

import { RiMenuLine, RiNotification3Line, RiSearchLine } from 'react-icons/ri';

interface TopbarProps {
  onMenuClick: () => void;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const roleColors: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  coordinator: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  student: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  company: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

export default function DashboardTopbar({ onMenuClick, user }: TopbarProps) {
  const displayName = user?.name ?? 'Admin User';
  const displayRole = user?.role ?? 'admin';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleBadgeClass =
    roleColors[displayRole.toLowerCase()] ??
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 gap-4 shrink-0">
      {/* Left: menu + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <RiMenuLine className="text-xl" />
        </button>

        <div className="relative max-w-sm w-full hidden sm:block">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
          <input
            type="search"
            placeholder="Search users, roles…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <RiNotification3Line className="text-xl" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="flex items-center gap-2.5 pl-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold select-none">
            {initials}
          </div>

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{displayName}</span>
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full self-start ${roleBadgeClass}`}>
              {displayRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
