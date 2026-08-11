"use client";

import { useEffect } from "react";
import ErrorState from "@/components/ui/ErrorState";

// Catches render/data errors anywhere under the (storefront) group that
// isn't caught by a more specific error.tsx (shop, product, account,
// checkout each have their own — this is the fallback for the homepage
// and anything else directly under this group).
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook point for production error monitoring (Sentry etc.) — logged
    // here rather than shown to the user; ErrorState below only ever
    // renders branded copy, never error.message.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-32">
      <ErrorState
        title="This page hit a snag"
        description="Something didn't load right. Try again, or head back to the homepage."
        onRetry={reset}
      />
    </div>
  );
}
