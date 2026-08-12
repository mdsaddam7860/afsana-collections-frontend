"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

// Middleware (src/middleware.ts) catches a dead refresh token on the
// NEXT navigation, but someone sitting on an already-open tab when
// their 7-day refresh token expires won't hit middleware again until
// they click somewhere. This watches the session client-side and signs
// out immediately once lib/auth.ts's jwt callback marks the token as
// "RefreshAccessTokenError", instead of leaving the tab in a state
// where every API call just silently 401s.
export default function AuthSessionWatcher() {
  const { data: session } = useSession();
  const sessionError = (session as unknown as { error?: string } | null)?.error;

  useEffect(() => {
    if (sessionError === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/account/login" });
    }
  }, [sessionError]);

  return null;
}
