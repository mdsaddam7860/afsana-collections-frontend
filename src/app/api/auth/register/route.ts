import { NextResponse } from "next/server";
import { registerUser } from "@/lib/api";

// Thin proxy to the Express API's POST /auth/register. Note this backend
// only takes email + password (no name field) and requires an OTP email
// verification step (POST /auth/verify-email) before login succeeds — a
// user can't log in immediately after registering. The signup page needs
// a "check your email for a code" step; that UI doesn't exist yet.
export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const result = await registerUser({ email, password });
  if (!result) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, needsVerification: true });
}
