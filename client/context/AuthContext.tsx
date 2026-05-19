'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, getStoredUser, saveAuth, clearAuth } from '../lib/auth';
import { postJson, getJson } from '../lib/api';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored?.token) {
      setUser(stored);
      // Optional: Fetch latest profile
      getJson<{ success: boolean; data: AuthUser }>('/auth/me').then(res => {
        if (res.ok && res.body?.success) {
          const authUser = { ...res.body.data, token: stored.token };
          saveAuth(authUser);
          setUser(authUser);
        } else {
          clearAuth();
          setUser(null);
        }
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string, role: AuthUser['role'] = 'student'): Promise<string | null> {
    const path = role === 'company' ? '/companies/login' : '/auth/login';
    const res = await postJson<LoginResponse>(path, { email, password });
    if (res.ok && res.body?.success) {
      const authUser = { ...res.body.user, token: res.body.token };
      saveAuth(authUser);
      setUser(authUser);
      return null;
    }
    const body = res.body as { message?: string } | null;
    return body?.message ?? 'Login failed. Please check your credentials.';
  }

  async function logout() {
    await getJson('/auth/logout');
    clearAuth();
    setUser(null);
  }

  async function refreshUser() {
    const stored = getStoredUser();
    if (stored?.token) {
      const res = await getJson<{ success: boolean; data: AuthUser }>('/auth/me');
      if (res.ok && res.body?.success) {
        const authUser = { ...res.body.data, token: stored.token };
        saveAuth(authUser);
        setUser(authUser);
      }
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
