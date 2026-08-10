import { NextResponse } from "next/server";
import { listReviews } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const reviews = await listReviews(params.productId);
    return NextResponse.json(reviews);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load reviews.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
