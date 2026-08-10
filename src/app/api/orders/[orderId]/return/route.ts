import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initiateReturn } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { reason } = await request.json();
  if (!reason) {
    return NextResponse.json({ error: "A reason is required." }, { status: 400 });
  }
  try {
    const order = await initiateReturn(params.orderId, reason, accessToken);
    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start return.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
