'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, getStoredUser, saveAuth, clearAuth } from '../lib/auth';
import { postJson } from '../lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => null,
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<string | null> {
    const res = await postJson<{ data: AuthUser }>('/auth/login', { email, password });
    if (res.ok && res.body?.data) {
      saveAuth(res.body.data);
      setUser(res.body.data);
      return null;
    }
    const body = res.body as { error?: string } | null;
    return body?.error ?? 'Login failed. Please check your credentials.';
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
