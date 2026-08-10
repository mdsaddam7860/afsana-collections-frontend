import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteReview, updateReview } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = await request.json();
  try {
    const review = await updateReview(params.reviewId, body, accessToken);
    return NextResponse.json(review);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update review.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    await deleteReview(params.reviewId, accessToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete review.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
