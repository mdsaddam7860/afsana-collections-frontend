import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteProduct } from "@/lib/admin-api";

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
