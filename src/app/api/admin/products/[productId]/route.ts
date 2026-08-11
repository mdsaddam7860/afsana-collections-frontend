import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteProduct, updateProduct, type UpdateProductInput } from "@/lib/admin-api";

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

// PATCH /admin/products/:id — general update, used from InventoryTable
// to publish a DRAFT, archive a product, or edit its name/price/etc.
export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as UpdateProductInput;
  try {
    const product = await updateProduct(params.productId, body, auth.accessToken);
    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "No backend session." }, { status: 401 });
  }
  try {
    await deleteProduct(params.productId, accessToken);
    // Soft delete on the backend — product is hidden from GET /products
    // but not destroyed. { ok: true } here just confirms the call
    // succeeded, not that the row is gone.
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
