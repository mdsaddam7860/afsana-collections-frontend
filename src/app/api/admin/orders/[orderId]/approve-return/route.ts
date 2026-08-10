import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { approveReturn } from "@/lib/admin-api";

export async function POST(
  _request: Request,
  { params }: { params: { orderId: string } }
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
    const order = await approveReturn(params.orderId, accessToken);
    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to approve return.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
