import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateVariantStockBulk } from "@/lib/admin-api";

// Belt-and-suspenders: middleware.ts already blocks non-admins from
// reaching /admin pages, but API routes are a separate attack surface
// (can be hit directly, not just navigated to) so they re-check here.
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const accessToken = (session as unknown as { accessToken?: string })
    .accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "No backend session." }, { status: 401 });
  }

  // Accepts either a single { variantId, stockQuantity } edit or a
  // pre-batched { updates: [...] } array from InventoryTable, matching
  // the backend's bulk PATCH /admin/products/:variantId/inventory shape.
  const body = await request.json();
  const updates = body.updates ?? [
    { variantId: body.variantId, stockQuantity: body.stockQuantity ?? body.inventory },
  ];

  await updateVariantStockBulk(updates, accessToken);
  return NextResponse.json({ ok: true, updates });
}
