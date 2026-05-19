"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import type { AuthUser } from "../lib/auth";

/**
 * Redirects unauthenticated users to login and optionally enforces roles.
 * Use in client pages under the dashboard.
 */
export function useProtectedRoute(allowedRoles?: AuthUser["role"][]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, pathname, allowedRoles]);

  return { user, isLoading, isAllowed: Boolean(user && (!allowedRoles?.length || allowedRoles.includes(user.role))) };
}
