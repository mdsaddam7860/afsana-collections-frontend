"use client";

import { useState } from "react";
import Spinner from "./Spinner";

// Wraps an arbitrary retry action (refetch, router.refresh(), etc.) with a
// consistent loading state, rather than every EmptyState/ErrorState caller
// hand-rolling its own "retrying…" flag.
export default function RetryButton({
  onRetry,
  label = "Try again",
}: {
  onRetry: () => void | Promise<void>;
  label?: string;
}) {
  const [retrying, setRetrying] = useState(false);

  const handleClick = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={retrying}
      className="inline-flex items-center gap-2 rounded-pill border border-accent px-5 py-2 font-mono-price text-[11px] uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
    >
      {retrying && <Spinner size={12} />}
      {retrying ? "Retrying…" : label}
    </button>
  );
}
