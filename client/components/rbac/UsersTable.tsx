'use client';

import { useState } from 'react';
import {
  RiMoreLine,
  RiUserSettingsLine,
  RiUserLine,
  RiProhibitedLine,
  RiSearchLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFilterLine,
} from 'react-icons/ri';
import { cn } from '@/lib/utils';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onChangeRole: (user: User) => void;
  onDisableUser: (user: User) => void;
  onViewProfile: (user: User) => void;
}

const roleBadge: Record<string, string> = {
  admin: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  coordinator: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  student: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  company: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  inactive: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

const ROLES = ['all', 'admin', 'coordinator', 'student', 'company'];
const PAGE_SIZE = 8;

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 animate-pulse">
      <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" /><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" /></div></td>
      <td className="py-3 px-4"><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-40" /></td>
      <td className="py-3 px-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" /></td>
      <td className="py-3 px-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" /></td>
      <td className="py-3 px-4 text-right"><div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-8 ml-auto" /></td>
    </tr>
  );
}

export default function UsersTable({ users, loading, onChangeRole, onDisableUser, onViewProfile }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleAction = (action: () => void) => {
    setOpenMenu(null);
    action();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="relative flex items-center gap-2">
          <RiFilterLine className="text-slate-400 text-sm shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all pr-8 appearance-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-400 dark:text-slate-500">
                  <RiUserLine className="mx-auto text-3xl mb-3 opacity-40" />
                  <p className="text-sm">No users found</p>
                  {(search || roleFilter !== 'all') && (
                    <button
                      onClick={() => { setSearch(''); setRoleFilter('all'); }}
                      className="mt-2 text-xs text-indigo-500 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0">
                        {initials(user.name)}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', roleBadge[user.role] ?? 'bg-slate-100 text-slate-600')}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', statusBadge[user.status])}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label="Actions"
                    >
                      <RiMoreLine className="text-base" />
                    </button>

                    {openMenu === user.id && (
                      <div
                        className="absolute right-4 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1"
                        onMouseLeave={() => setOpenMenu(null)}
                      >
                        <button
                          onClick={() => handleAction(() => onChangeRole(user))}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <RiUserSettingsLine className="text-indigo-500" /> Change Role
                        </button>
                        <button
                          onClick={() => handleAction(() => onViewProfile(user))}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <RiUserLine className="text-slate-400" /> View Profile
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                        <button
                          onClick={() => handleAction(() => onDisableUser(user))}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <RiProhibitedLine /> Disable User
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{' '}
            of <span className="font-medium text-slate-700 dark:text-slate-300">{filtered.length}</span> users
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowLeftSLine />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`ellipsis-${p}`} className="px-1 text-slate-400 text-xs">…</span>
                  )}
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                      p === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
                    )}
                  >
                    {p}
                  </button>
                </>
              ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowRightSLine />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
