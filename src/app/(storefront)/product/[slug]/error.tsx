"use client";

import { useEffect } from "react";
import ErrorState from "@/components/ui/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-32">
      <ErrorState
        title="Couldn't load this product"
        description="Something went wrong loading this page."
        onRetry={reset}
      />
    </div>
  );
}
