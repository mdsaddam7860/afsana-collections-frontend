import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mergeGuestCart } from "@/lib/cart-api";
import type { CartLine } from "@/types";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { items } = (await request.json()) as { items: CartLine[] };
  try {
    await mergeGuestCart(items ?? [], accessToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Cart merge failing shouldn't block login — surface it but the
    // caller (login page) treats this as non-fatal.
    const message = err instanceof Error ? err.message : "Failed to merge cart.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
