import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/admin-api";

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

  const { orderId, status } = await request.json();
  const updated = await updateOrderStatus(orderId, status, accessToken);
  return NextResponse.json(updated);
}
