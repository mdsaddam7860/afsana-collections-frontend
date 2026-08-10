import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCategories } from "@/lib/admin-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const categories = await getCategories(accessToken);
  return NextResponse.json(categories);
}
