import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9933/api";

console.log("NextAuth Init - GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "exists" : "missing");


export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          let role = "student";
          try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            role = cookieStore.get("oauth_role")?.value || "student";
          } catch (cookieErr) {
            console.warn("Could not read cookies in NextAuth signIn:", cookieErr);
          }

          const nextAuthSecret = process.env.NEXTAUTH_SECRET || "";
          const response = await axios.post(
            `${API_URL}/oauth/nextauth-login`,
            {
              email: user.email,
              name: user.name,
              avatar: user.image,
              role: role,
              provider: "google",
              googleId: account.providerAccountId,
            },
            {
              headers: nextAuthSecret
                ? { Authorization: `Bearer ${nextAuthSecret}` }
                : undefined,
            },
          );

          if (response.data?.success) {
            (user as any).backendToken = response.data.token;
            (user as any).backendUser = response.data.user;
            return true;
          }
          // Throw so NextAuth redirects with `error=OAuthSignin` (more accurate than AccessDenied).
          throw new Error(response.data?.message || "Backend sync failed");
        } catch (error: any) {
          const details = error?.response?.data || error?.message || error;
          console.error("NextAuth signIn callback error:", details);
          // Throw (don't return false) so UI gets `OAuthSignin` instead of `AccessDenied`.
          throw new Error(
            typeof details === "string"
              ? details
              : details?.message || "Backend sync failed",
          );
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = (user as any).backendToken;
        token.backendUser = (user as any).backendUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).backendToken = token.backendToken;
        (session as any).backendUser = token.backendUser;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
