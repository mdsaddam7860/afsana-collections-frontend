import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { loginWithCredentials } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

// Must match the backend's real token lifetimes exactly, or the refresh
// cycle drifts out of sync with it:
//   - accessToken: 5 minutes (was 25 — backend's actual value keeps
//     changing as the backend team tunes it; this constant is the only
//     place that needs updating when it does).
//   - refreshToken: 7 days — see session.maxAge below, kept in sync so
//     the outer NextAuth session cookie doesn't outlive the backend
//     refresh token it wraps.
const ACCESS_TOKEN_LIFETIME_MS = 5 * 60 * 1000;
const REFRESH_TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

// Single-flight guard: with only a 5-minute accessToken lifetime,
// checkout alone can fire several near-simultaneous server-side calls
// (syncCartToBackend, getCurrentUser, createOrder, createPaymentIntent
// all happen in one /api/checkout request) — if the token happens to
// be expired right as that request comes in, NextAuth's jwt() callback
// can genuinely be invoked multiple times in close succession (this
// route plus a concurrent middleware/RSC request reading the session).
// Without this guard, each of those calls independently POSTs to
// /auth/refresh with the SAME refreshToken; if the backend rotates
// refresh tokens (issues a new one and invalidates the old on use —
// standard, secure behavior), the first call's response invalidates
// that refreshToken, and every other concurrent call using the
// now-stale value fails with a real "invalid refresh token" error even
// though the session is fine — which is exactly what "expired
// mid-checkout and didn't refresh" looks like from the outside.
// Keying by the refreshToken string means concurrent calls for the
// same session share one in-flight request instead of racing.
const inFlightRefreshes = new Map<string, Promise<any>>();

async function refreshAccessToken(token: any) {
  const key = token.refreshToken as string;
  const existing = inFlightRefreshes.get(key);
  if (existing) return existing;

  const promise = doRefresh(token);
  inFlightRefreshes.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlightRefreshes.delete(key);
  }
}

async function doRefresh(token: any) {
  try {
    // Double check that API_BASE_URL includes '/api' if your backend requires it
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    // Safely parse the response to prevent 502 crashes
    const textResponse = await response.text();
    let refreshedTokens;

    try {
      refreshedTokens = JSON.parse(textResponse);
    } catch {
      console.error("❌ Backend did not return JSON. Raw response:", textResponse);
      throw new Error("Invalid response from refresh endpoint");
    }

    if (!response.ok) {
      console.error("❌ Backend rejected refresh token:", refreshedTokens);
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
      // Clear any previous error now that refresh succeeded — otherwise
      // a stale "RefreshAccessTokenError" from an earlier failed attempt
      // could linger on the token and keep tripping the sign-out watcher
      // (see AuthSessionWatcher) even after a subsequent refresh worked.
      error: undefined,
    };
  } catch (error) {
    console.error("❌ Refresh logic failed:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const result = await loginWithCredentials(
          credentials.email,
          credentials.password
        );
        if (!result) return null;

        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        } as never;
      },
    }),
  ],
  // maxAge caps the outer NextAuth session/cookie at the same 7 days the
  // backend's refresh token actually lives for — see the comment above
  // ACCESS_TOKEN_LIFETIME_MS for why this matters.
  session: { strategy: "jwt", maxAge: REFRESH_TOKEN_LIFETIME_SECONDS },
  callbacks: {
    jwt: async ({ token, user }) => {
      // 1. Initial sign in
      if (user) {
        const u = user as unknown as {
          role?: string;
          id?: string;
          accessToken?: string;
          refreshToken?: string;
        };
        token.role = (u.role ?? "customer").toLowerCase();
        token.id = u.id;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFETIME_MS;
        token.error = undefined;

        return token;
      }

      // 2. Subsequent use: Return the token if it has NOT expired yet.
      // We subtract 1 minute (60000ms) as a buffer so we refresh just before it dies.
      if (Date.now() < (token.accessTokenExpires as number) - 60000) {
        return token;
      }

      // 3. Token has expired, try to refresh it
      return await refreshAccessToken(token);
    },

    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }

      // Pass tokens to the frontend/server components
      (session as unknown as { accessToken?: string }).accessToken = token.accessToken as string | undefined;

      // Pass the error to the client so it knows if the refresh failed (e.g., refresh token expired)
      (session as unknown as { error?: string }).error = token.error as string | undefined;

      return session;
    },
  },
  pages: {
    signIn: "/account/login",
  },
};
