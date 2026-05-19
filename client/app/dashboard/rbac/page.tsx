'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  RiShieldUserLine,
  RiUserLine,
  RiGroupLine,
  RiBriefcaseLine,
  RiRefreshLine,
} from 'react-icons/ri';

import DashboardLayout from '@/components/rbac/DashboardLayout';
import RoleCard, { RoleCardProps } from '@/components/rbac/RoleCard';
import UsersTable, { User } from '@/components/rbac/UsersTable';
import RoleModal from '@/components/rbac/RoleModal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoleInfo {
  name: string;
  count: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_META: Omit<RoleCardProps, 'userCount' | 'loading'>[] = [
  {
    name: 'Admin',
    description: 'Full platform access. Manages users, roles, and system configuration.',
    icon: RiShieldUserLine,
    color: 'indigo',
  },
  {
    name: 'Coordinator',
    description: 'Oversees internship programs, reviews applications, and manages company relationships.',
    icon: RiGroupLine,
    color: 'emerald',
  },
  {
    name: 'Student',
    description: 'Browses and applies to internships, tracks application status.',
    icon: RiUserLine,
    color: 'sky',
  },
  {
    name: 'Company',
    description: 'Posts internship listings and manages applicant pipelines.',
    icon: RiBriefcaseLine,
    color: 'amber',
  },
];

// ─── API helpers ──────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RBACPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get<{ users: User[] }>('/rbac/users');
      setUsers(res.data.users ?? res.data as unknown as User[]);
    } catch {
      // Use mock data for development / preview
      setUsers(MOCK_USERS);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const res = await api.get<{ roles: RoleInfo[] }>('/rbac/roles');
      setRoles(res.data.roles ?? res.data as unknown as RoleInfo[]);
    } catch {
      // Fall back to counts derived from mock users
      setRoles([
        { name: 'admin', count: 2 },
        { name: 'coordinator', count: 5 },
        { name: 'student', count: 38 },
        { name: 'company', count: 12 },
      ]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Change role
  const handleSaveRole = async (userId: string, newRole: string) => {
    await api.post(`/rbac/users/${userId}/role`, { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setRoles((prev) =>
      prev.map((r) => ({
        ...r,
        count:
          r.name === newRole
            ? r.count + 1
            : r.name === selectedUser?.role
            ? Math.max(0, r.count - 1)
            : r.count,
      }))
    );
  };

  const getRoleCount = (roleName: string) =>
    roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase())?.count ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Roles & Access Control
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage user roles and permissions across the platform.
            </p>
          </div>
          <button
            onClick={() => { fetchUsers(); fetchRoles(); }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RiRefreshLine className="text-base" /> Refresh
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Role Cards */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
            Roles Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLE_META.map((meta) => (
              <RoleCard
                key={meta.name}
                {...meta}
                userCount={getRoleCount(meta.name)}
                loading={rolesLoading}
              />
            ))}
          </div>
        </section>

        {/* Users Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Users Management
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {usersLoading ? '…' : `${users.length} total users`}
            </span>
          </div>

          <UsersTable
            users={users}
            loading={usersLoading}
            onChangeRole={(user) => setSelectedUser(user)}
            onViewProfile={(user) => window.open(`/profile/${user.id}`, '_blank')}
            onDisableUser={(user) => {
              if (confirm(`Disable user "${user.name}"?`)) {
                setUsers((prev) =>
                  prev.map((u) => (u.id === user.id ? { ...u, status: 'inactive' } : u))
                );
              }
            }}
          />
        </section>
      </div>

      {/* Role Modal */}
      {selectedUser && (
        <RoleModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveRole}
        />
      )}
    </DashboardLayout>
  );
}

// ─── Mock data (fallback when API is unavailable) ─────────────────────────────
const MOCK_USERS: User[] = [
  { id: '1', name: 'Arjun Mehta', email: 'arjun.mehta@college.edu', role: 'student', status: 'active' },
  { id: '2', name: 'Priya Sharma', email: 'priya.sharma@college.edu', role: 'student', status: 'active' },
  { id: '3', name: 'Rahul Verma', email: 'rahul.verma@college.edu', role: 'student', status: 'pending' },
  { id: '4', name: 'Sneha Iyer', email: 'sneha.iyer@college.edu', role: 'student', status: 'active' },
  { id: '5', name: 'Vikram Das', email: 'vikram.das@college.edu', role: 'student', status: 'inactive' },
  { id: '6', name: 'Dr. Anita Nair', email: 'anita.nair@college.edu', role: 'coordinator', status: 'active' },
  { id: '7', name: 'Prof. Rajan Kumar', email: 'rajan.kumar@college.edu', role: 'coordinator', status: 'active' },
  { id: '8', name: 'Ms. Deepa Patel', email: 'deepa.patel@college.edu', role: 'coordinator', status: 'active' },
  { id: '9', name: 'TechCorp HR', email: 'hr@techcorp.com', role: 'company', status: 'active' },
  { id: '10', name: 'InnoSoft Recruiter', email: 'recruit@innosoft.io', role: 'company', status: 'active' },
  { id: '11', name: 'Nexus Labs', email: 'intern@nexuslabs.com', role: 'company', status: 'inactive' },
  { id: '12', name: 'System Admin', email: 'admin@portal.edu', role: 'admin', status: 'active' },
  { id: '13', name: 'Super Admin', email: 'superadmin@portal.edu', role: 'admin', status: 'active' },
  { id: '14', name: 'Kavya Reddy', email: 'kavya.reddy@college.edu', role: 'student', status: 'active' },
  { id: '15', name: 'Manish Joshi', email: 'manish.joshi@college.edu', role: 'student', status: 'pending' },
  { id: '16', name: 'Swati Kulkarni', email: 'swati.kulkarni@college.edu', role: 'student', status: 'active' },
  { id: '17', name: 'Arun Pillai', email: 'arun.pillai@college.edu', role: 'student', status: 'active' },
  { id: '18', name: 'FutureTech Inc', email: 'jobs@futuretech.in', role: 'company', status: 'active' },
];
