import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReview } from "@/lib/api";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
  }
  const { productId, rating, title, body } = await request.json();
  if (!productId || !rating || !title || !body) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  try {
    const review = await createReview(productId, { rating, title, body }, accessToken);
    return NextResponse.json(review);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to post review.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
