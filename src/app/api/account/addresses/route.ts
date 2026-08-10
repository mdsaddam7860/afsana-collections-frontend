import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAddress, listAddresses } from "@/lib/api";

function getAccessToken(session: unknown): string | undefined {
  return (session as { accessToken?: string } | null)?.accessToken;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const addresses = await listAddresses(accessToken);
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = await request.json();
  try {
    const address = await createAddress(body, accessToken);
    return NextResponse.json(address);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save address.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
