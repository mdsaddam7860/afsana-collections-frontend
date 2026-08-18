import { NextResponse } from "next/server";
import { confirmPasswordReset } from "@/lib/api";

export async function POST(request: Request) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json(
      { error: "Reset link is missing its token, or no new password was given." },
      { status: 400 }
    );
  }
  try {
    await confirmPasswordReset(token, password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Couldn't reset your password.";
    // A genuinely expired/used/invalid token should surface clearly
    // rather than a generic 502 — this is the one case in the reset
    // flow where being specific actually helps the person (vs. the
    // request-a-reset step, which deliberately stays generic).
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
