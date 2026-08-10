"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { Review } from "@/types";

export default function ReviewsSection({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  };

  useEffect(load, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, body }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't post your review.");
      return;
    }
    setTitle("");
    setBody("");
    setRating(5);
    load();
  };

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
      <h2 className="font-display text-fluid-h2 italic text-foreground">
        Reviews
      </h2>

      {reviews === null ? (
        <p className="mt-6 font-mono-price text-xs uppercase tracking-widest text-muted">
          Loading…
        </p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No reviews yet — be the first.</p>
      ) : (
        <div className="mt-6 space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-soft border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono-price text-xs text-accent">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                <span className="text-xs text-muted">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 font-display italic text-foreground">{r.title}</p>
              <p className="mt-1 text-sm text-muted">{r.body}</p>
              {r.authorName && (
                <p className="mt-2 text-xs text-muted">— {r.authorName}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-border pt-8">
        <h3 className="font-display text-lg italic text-foreground">
          Leave a review
        </h3>
        {!session?.user ? (
          <p className="mt-3 text-sm text-muted">
            <Link href="/account/login" className="text-accent hover:opacity-70">
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n} className="bg-surface">
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
            />
            <textarea
              placeholder="Your review"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={3}
              className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
            />
            {error && (
              <p role="alert" className="font-mono-price text-xs text-accent">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-fill rounded-pill border border-accent px-6 py-2.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post review"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
