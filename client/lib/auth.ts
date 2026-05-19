export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'company' | 'admin' | 'coordinator';
  avatar?: string;
  token?: string;
}

const TOKEN_KEY = 'internship_token';
const USER_KEY  = 'internship_user';

export function saveAuth(user: AuthUser) {
  if (user.token) {
    localStorage.setItem(TOKEN_KEY, user.token);
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
