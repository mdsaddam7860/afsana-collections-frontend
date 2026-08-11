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
    callbacks: {
      // Require *some* signed-in session for /admin or /account (the
      // role check above then narrows /admin further to admins only);
      // checkout doesn't require auth since guest checkout is allowed.
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // /account/login and /account/signup must stay excluded — they
        // ARE the pages an unauthenticated visitor is redirected to, so
        // requiring auth on them would create a redirect loop (login
        // page requires being logged in to view the login page).
        const isAuthPage = path === "/account/login" || path === "/account/signup";
        if ((path.startsWith("/admin") || path.startsWith("/account")) && !isAuthPage) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};