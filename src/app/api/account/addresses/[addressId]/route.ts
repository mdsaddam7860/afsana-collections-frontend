import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteAddress, updateAddress } from "@/lib/api";

function getAccessToken(session: unknown): string | undefined {
  return (session as { accessToken?: string } | null)?.accessToken;
}

export async function PATCH(
  request: Request,
  { params }: { params: { addressId: string } }
) {
  const session = await getServerSession(authOptions);
  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = await request.json();
  try {
    const address = await updateAddress(params.addressId, body, accessToken);
    return NextResponse.json(address);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update address.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { addressId: string } }
) {
  const session = await getServerSession(authOptions);
  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    await deleteAddress(params.addressId, accessToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete address.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
