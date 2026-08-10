import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createProduct, type CreateProductInput } from "@/lib/admin-api";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "No backend session." }, { status: 401 });
  }
  const body = (await request.json()) as CreateProductInput;
  try {
    const product = await createProduct(body, accessToken);
    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
