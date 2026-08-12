import { NextResponse } from "next/server";
import { registerUser } from "@/lib/api";

// Thin proxy to the Express API's POST /auth/register, which accepts
// email + password + optional name/phone, and requires an OTP email
// verification step (POST /auth/verify-email) before login succeeds — a
// user can't log in immediately after registering. The signup page needs
// a "check your email for a code" step; that UI doesn't exist yet.
export async function POST(request: Request) {
  const { email, password, name, phone } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  try {
    const result = await registerUser({ email, password, name, phone });
    if (!result) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true, needsVerification: true });
  } catch (err) {
    // apiFetch throws with the backend's real error message baked in
    // (e.g. a phone-format 400, weak password, etc.) — surface that
    // instead of a generic message so validation errors are actionable.
    const message = err instanceof Error ? err.message : "Something went wrong creating your account.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}