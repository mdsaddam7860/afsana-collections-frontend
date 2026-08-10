import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Runs at the edge, before any admin page/component is rendered or sent
// to the client — so a non-admin never receives the admin bundle at all,
// not even a flash of it before a client-side redirect.
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
      // Require *some* signed-in session for /admin; the role check above
      // then narrows it to admins specifically.
      authorized: ({ token, req }) =>
        !req.nextUrl.pathname.startsWith("/admin") || !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
