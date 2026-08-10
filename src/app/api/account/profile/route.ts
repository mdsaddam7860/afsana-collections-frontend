import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser, updateCurrentUser } from "@/lib/api";

function getAccessToken(session: unknown): string | undefined {
  return (session as { accessToken?: string } | null)?.accessToken;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const user = await getCurrentUser(accessToken);
    return NextResponse.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load profile.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = await request.json();
  try {
    const user = await updateCurrentUser(body, accessToken);
    return NextResponse.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
