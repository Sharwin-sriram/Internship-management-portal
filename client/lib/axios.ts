import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuth, getToken } from "./auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9933/api";

/** Socket.IO connects to API origin (no /api suffix) */
export const SOCKET_ORIGIN =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  API_BASE.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; errors?: unknown }>) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      const url = String(error.config?.url || "");
      const isAuthAttempt =
        url.includes("/auth/login") ||
        url.includes("/companies/login") ||
        url.includes("/auth/register");
      if (!isAuthAttempt) {
        clearAuth();
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/register")) {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
