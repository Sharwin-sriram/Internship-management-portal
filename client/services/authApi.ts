import api from "../lib/axios";
import type { AuthUser } from "../lib/auth";

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export async function loginStudent(body: LoginBody) {
  const { data } = await api.post<LoginResult>("/auth/login", body);
  return data;
}

export async function loginCompany(body: LoginBody) {
  const { data } = await api.post<LoginResult>("/companies/login", body);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<{ success: boolean; data: AuthUser }>("/auth/me");
  return data;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}

export async function exchangeOAuthCode(code: string) {
  const { data } = await api.post<LoginResult>("/oauth/exchange", { code });
  return data;
}

export async function requestEmailVerification() {
  const { data } = await api.post<{ success: boolean; message?: string }>(
    "/auth/verify-email/request",
  );
  return data;
}

export async function confirmEmailVerification(token: string) {
  const { data } = await api.get<{ success: boolean; message?: string }>(
    "/auth/verify-email",
    { params: { token } },
  );
  return data;
}
