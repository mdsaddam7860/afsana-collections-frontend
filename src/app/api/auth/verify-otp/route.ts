import { NextResponse } from "next/server";
import { verifyRegistrationOtp } from "@/lib/api";

// Unauthenticated on purpose — a freshly-registered person has no
// session yet (they can't sign in until this succeeds), so this can't
// require one the way the account-settings resend flow does.
export async function POST(request: Request) {
  const { email, otp } = await request.json();
  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and code are both required." },
      { status: 400 }
    );
  }
  try {
    const ok = await verifyRegistrationOtp(email, otp);
    if (!ok) {
      return NextResponse.json({ error: "That code didn't work." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "That code didn't work.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
