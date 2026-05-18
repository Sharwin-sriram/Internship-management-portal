const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  body: T | null;
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  data?: unknown,
  auth = false
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth ? (getAuthHeaders() as Record<string, string>) : {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
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

export const postJson = <T = unknown>(path: string, data: unknown) =>
  request<T>('POST', path, data);

export const getJson = <T = unknown>(path: string) =>
  request<T>('GET', path, undefined, true);

export const putJson = <T = unknown>(path: string, data: unknown) =>
  request<T>('PUT', path, data, true);

export const deleteJson = <T = unknown>(path: string) =>
  request<T>('DELETE', path, undefined, true);
