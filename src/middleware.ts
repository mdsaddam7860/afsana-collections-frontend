import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Runs at the edge, before any admin/account page or component is
// rendered or sent to the client — so a signed-out visitor to /account
// never even briefly sees the account page's own client-side loading
// skeleton before its useEffect-based redirect kicks in; they're
// redirected before any of it downloads.
export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as { role?: string } | null)?.role;
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/account/login", req.url));
    }
    return NextResponse.next();
  },
  {
    // IMPORTANT: this `pages` block is what makes withAuth redirect an
    // unauthenticated visitor to the app's actual styled /account/login
    // page. Without it, withAuth falls back to NextAuth's own generic,
    // unbranded /api/auth/signin page — a real, previously-shipped bug:
    // visiting /account with no session landed on that default page
    // instead of the app's login form, which looked like the account
    // area was reachable without signing in. This is a SEPARATE `pages`
    // option from the one in lib/auth.ts's authOptions (withAuth doesn't
    // read authOptions at all), so both need to stay in sync by hand.
    pages: {
      signIn: "/account/login",
    },
    callbacks: {
      // Require *some* signed-in session for /admin or /account (the
      // role check above then narrows /admin further to admins only);
      // checkout doesn't require auth since guest checkout is allowed.
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // /account/login, /account/signup, and /account/forgot-password
        // must stay excluded — these ARE the pages an unauthenticated
        // visitor needs to reach, so requiring auth on them would
        // create a redirect loop (login page requires being logged in
        // to view the login page).
        const isAuthPage =
          path === "/account/login" ||
          path === "/account/signup" ||
          path === "/account/forgot-password";
        if ((path.startsWith("/admin") || path.startsWith("/account")) && !isAuthPage) {
          // A token with `error: "RefreshAccessTokenError"` (see
          // lib/auth.ts) means its refresh token is dead — expired,
          // revoked, or the backend rejected it — and its accessToken
          // is stale. `!!token` alone stays true in that case (the JWT
          // itself is still a valid, signed NextAuth token, just
          // carrying a dead pair of backend tokens), which previously
          // let people straight through to /account or /admin with no
          // way to actually call the backend once there. Treating an
          // errored token as unauthenticated forces a clean bounce back
          // to login instead of a silently broken page.
          return !!token && !(token as { error?: string }).error;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};