import { getToken } from './auth';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9933/api';
const API_BASE_CACHE_KEY = 'internhub_api_base_url';
let resolvedBaseUrl: string | null = null;

function getCandidateBases(): string[] {
  const bases = [DEFAULT_BASE_URL];
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    for (let port = 9933; port <= 9943; port += 1) {
      bases.push(`http://localhost:${port}/api`);
    }
  }
  return Array.from(new Set(bases));
}

async function isReachable(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/test`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resolveBaseUrl(forceRefresh = false): Promise<string> {
  if (!forceRefresh && resolvedBaseUrl) return resolvedBaseUrl;

  if (!forceRefresh && typeof window !== 'undefined') {
    const cached = window.localStorage.getItem(API_BASE_CACHE_KEY);
    if (cached && (await isReachable(cached))) {
      resolvedBaseUrl = cached;
      return cached;
    }
  }

  const candidates = getCandidateBases();
  for (const base of candidates) {
    if (await isReachable(base)) {
      resolvedBaseUrl = base;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(API_BASE_CACHE_KEY, base);
      }
      return base;
    }
  }

  resolvedBaseUrl = DEFAULT_BASE_URL;
  return resolvedBaseUrl;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  body: T | null;
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  data?: unknown,
  auth = false
): Promise<ApiResponse<T>> {
  const baseUrl = await resolveBaseUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth ? (getAuthHeaders() as Record<string, string>) : {}),
  };

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });

    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body: body as T };
  } catch {
    // One recovery attempt in case backend restarted on a fallback port.
    try {
      const refreshedBaseUrl = await resolveBaseUrl(true);
      const res = await fetch(`${refreshedBaseUrl}${path}`, {
        method,
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
      const body = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, body: body as T };
    } catch {
      return { ok: false, status: 0, body: null };
    }
  }
}

export const postJson = <T = unknown>(path: string, data: unknown) =>
  request<T>('POST', path, data);

export const postAuthJson = <T = unknown>(path: string, data: unknown) =>
  request<T>('POST', path, data, true);

export const getJson = <T = unknown>(path: string) =>
  request<T>('GET', path, undefined, true);

/** GET without Authorization header (public endpoints). */
export const getPublicJson = <T = unknown>(path: string) =>
  request<T>('GET', path, undefined, false);

export const putJson = <T = unknown>(path: string, data: unknown) =>
  request<T>('PUT', path, data, true);

export const deleteJson = <T = unknown>(path: string) =>
  request<T>('DELETE', path, undefined, true);

export const patchJson = <T = unknown>(path: string, data: unknown) =>
  request<T>('PATCH', path, data, true);

export async function postForm<T = unknown>(
  path: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const baseUrl = await resolveBaseUrl();
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body: body as T };
  } catch {
    return { ok: false, status: 0, body: null };
  }
}

export async function downloadBlob(path: string): Promise<Blob | null> {
  try {
    const baseUrl = await resolveBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.blob();
  } catch {
    return null;
  }
}

export const BASE_URL = DEFAULT_BASE_URL;
