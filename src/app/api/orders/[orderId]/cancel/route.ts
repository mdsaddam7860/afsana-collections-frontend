import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cancelOrder } from "@/lib/api";

export async function POST(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const order = await cancelOrder(params.orderId, accessToken);
    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
