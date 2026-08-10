import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDiscount, listDiscounts, type DiscountInput } from "@/lib/admin-api";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) {
    return { error: NextResponse.json({ error: "No backend session." }, { status: 401 }) };
  }
  return { accessToken };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const discounts = await listDiscounts(auth.accessToken);
  return NextResponse.json(discounts);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as DiscountInput;
  try {
    const discount = await createDiscount(body, auth.accessToken);
    return NextResponse.json(discount);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create discount.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
