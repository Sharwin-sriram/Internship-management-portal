'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AuthUser, getStoredUser, saveAuth, clearAuth } from '../lib/auth';
import * as authApi from '../services/authApi';

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string, role?: AuthUser['role']) => Promise<string | null>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => null,
  logout: () => {},
  isLoading: true,
  refreshUser: async () => {},
});

function normalizeUser(
  raw: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: AuthUser['role'];
    emailVerified?: boolean;
  },
  token: string,
): AuthUser {
  const id = raw.id ?? (raw as { _id?: string })._id;
  return {
    id: id != null ? String(id) : '',
    name: raw.name,
    email: raw.email,
    role: raw.role,
    token,
    emailVerified: Boolean(raw.emailVerified),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // Sync NextAuth session
  useEffect(() => {
    if (status === 'loading') return;

    if (session && (session as any).backendToken && (session as any).backendUser) {
      const backendUser = (session as any).backendUser;
      const backendToken = (session as any).backendToken;

      const authUser: AuthUser = {
        id: String(backendUser.id || backendUser._id),
        name: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        avatar: backendUser.avatar,
        token: backendToken,
      };

      const stored = getStoredUser();
      if (!stored || stored.token !== backendToken) {
        saveAuth(authUser);
        setUser(authUser);
      }
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      const stored = getStoredUser();
      if (!stored?.token) {
        setIsLoading(false);
      }
    }
  }, [session, status]);

  // Sync legacy localStorage session
  useEffect(() => {
    const stored = getStoredUser();
    if (stored?.token) {
      setUser(stored);
      authApi.fetchMe().then((res) => {
        if (res.success && res.data) {
          const authUser = normalizeUser(res.data as never, stored.token!);
          saveAuth(authUser);
          setUser(authUser);
        } else {
          clearAuth();
          setUser(null);
        }
      }).catch(() => {
        clearAuth();
        setUser(null);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      if (status !== 'loading' && !session) {
        setIsLoading(false);
      }
    }
  }, [status, session]);

  // Redirect logged-in users away from auth pages
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/login' || path === '/register' || path === '/admin/login') {
        let target = '/dashboard';
        if (user.role === 'company') target = '/dashboard/company';
        else if (user.role === 'admin') target = '/dashboard/admin';
        window.location.href = target;
      }
    }
  }, [user]);

  async function login(email: string, password: string, role: AuthUser['role'] = 'student'): Promise<string | null> {
    try {
      const data =
        role === 'company'
          ? await authApi.loginCompany({ email, password })
          : role === 'admin'
            ? await authApi.loginAdmin({ email, password })
            : await authApi.loginStudent({ email, password });

      if (data.success && data.token && data.user) {
        const authUser = normalizeUser(data.user as never, data.token);
        if (role === 'admin' && authUser.role !== 'admin') {
          return 'Access denied. Only admin accounts can sign in here.';
        }
        saveAuth(authUser);
        setUser(authUser);
        return null;
      }
      return data.message ?? 'Login failed. Please check your credentials.';
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      return msg ?? 'Login failed. Please check your credentials.';
    }
  }

  async function logout() {
    try {
      await authApi.logoutRequest();
    } catch {
      /* ignore */
    }
    clearAuth();
    setUser(null);
    try {
      await signOut({ redirect: false });
    } catch {
      /* ignore */
    }
  }

  async function refreshUser() {
    const stored = getStoredUser();
    if (!stored?.token) return;
    try {
      const res = await authApi.fetchMe();
      if (res.success && res.data) {
        const authUser = normalizeUser(res.data as never, stored.token);
        saveAuth(authUser);
        setUser(authUser);
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
