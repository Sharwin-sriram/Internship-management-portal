export type OAuthProvider = 'google' | 'github';
export type OAuthRole = 'student' | 'company';

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9933/api'
).replace(/\/api\/?$/, '');

export interface StartOAuthOptions {
  /** Kept for compatibility if you later add provider params. */
  selectAccount?: boolean;
  /** Kept for compatibility if you later add provider params. */
  forceConsent?: boolean;
}

/**
 * Backend OAuth start (currently used for GitHub in this app).
 * Google login uses NextAuth (real Google OAuth).
 */
export function startOAuth(
  provider: OAuthProvider,
  role: OAuthRole,
  options?: StartOAuthOptions,
) {
  const params = new URLSearchParams({ role });
  void options;
  window.location.href = `${API_ORIGIN}/api/oauth/${provider}?${params.toString()}`;
}
