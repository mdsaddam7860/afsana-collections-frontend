import { NextResponse } from "next/server";
import { resendVerificationOtp } from "@/lib/api";

// Unauthenticated counterpart to /api/account/resend-verification
// (which requires a session and pulls the email from it — fine for an
// already-logged-in-but-unverified user in ProfilePanel, but useless
// here since someone on the registration OTP screen has no session at
// all yet). Takes email directly in the body instead, same pattern as
// resendVerificationOtp() in lib/api.ts already supports.
//
// Rate-limited server-side per the original resend-verification
// endpoint (5/15min) — the 60s cooldown in the UI is a courtesy, not
// the actual enforcement.
export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  try {
    await resendVerificationOtp(email);
  } catch {
    // Same generic-success pattern as forgot-password: don't leak
    // whether the email exists or whether it's already verified.
  }
  return NextResponse.json({ ok: true });
}
