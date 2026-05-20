'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string, role: AuthUser['role'] = 'student'): Promise<string | null> {
    try {
      const data =
        role === 'company'
          ? await authApi.loginCompany({ email, password })
          : await authApi.loginStudent({ email, password });

      if (data.success && data.token && data.user) {
        const authUser = normalizeUser(data.user as never, data.token);
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
