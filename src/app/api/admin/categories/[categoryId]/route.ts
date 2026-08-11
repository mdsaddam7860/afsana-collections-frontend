import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  deactivateCategory,
  updateCategory,
  type CategoryInput,
} from "@/lib/admin-api";

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
  { params }: { params: { categoryId: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Partial<CategoryInput>;
  try {
    const category = await updateCategory(params.categoryId, body, auth.accessToken);
    return NextResponse.json(category);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update category.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// Soft-disable, not a hard delete — see deactivateCategory in admin-api.ts.
export async function DELETE(
  _request: Request,
  { params }: { params: { categoryId: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  try {
    await deactivateCategory(params.categoryId, auth.accessToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to deactivate category.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
