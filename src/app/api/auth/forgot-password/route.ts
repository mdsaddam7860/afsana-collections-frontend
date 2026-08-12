import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/api";

// Always returns ok:true regardless of whether the email exists — the
// backend itself is deliberately generic here (no "email not found"
// state) to avoid leaking which addresses have accounts. Swallow
// backend errors the same way rather than surfacing a 502, for the
// same reason.
export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  try {
    await requestPasswordReset(email);
  } catch {
    // Intentionally swallowed — see comment above.
  }
  return NextResponse.json({ ok: true });
}
