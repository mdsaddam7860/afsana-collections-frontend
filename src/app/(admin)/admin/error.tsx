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
    <ErrorState
      title="This admin screen hit a snag"
      // Unlike the storefront's default (never leak raw backend errors
      // to customers), admin screens are for trusted staff who need to
      // know exactly what broke to do anything about it — a generic
      // "something went wrong" here just hides the one piece of info
      // (e.g. "both lookup attempts 401'd — stale access token") that
      // would actually explain the failure.
      description={error.message || "Something went wrong loading this data."}
      onRetry={reset}
    />
  );
}
