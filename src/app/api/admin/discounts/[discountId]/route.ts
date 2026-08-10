import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deactivateDiscount, updateDiscount, type DiscountInput } from "@/lib/admin-api";

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

export async function PATCH(
  request: Request,
  { params }: { params: { discountId: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Partial<DiscountInput>;
  try {
    const discount = await updateDiscount(params.discountId, body, auth.accessToken);
    return NextResponse.json(discount);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update discount.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { discountId: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  try {
    await deactivateDiscount(params.discountId, auth.accessToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to deactivate discount.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
