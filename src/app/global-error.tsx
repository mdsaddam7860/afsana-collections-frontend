"use client";

import { useEffect } from "react";

// Only fires if the ROOT layout itself throws (fonts, providers, etc.) —
// every other error is caught by the nearer error.tsx files. Next.js
// requires this to render its own <html>/<body> since it replaces the
// root layout entirely when active, so it can't reuse ErrorState's
// normal styling context (globals.css/fonts aren't guaranteed to have
// loaded) — kept intentionally minimal and inline-styled for that reason.
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          background: "#211820",
          color: "#F2EAE4",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <p style={{ fontSize: "1.5rem", fontStyle: "italic" }}>
          Afsana Collections
        </p>
        <p style={{ marginTop: "12px", opacity: 0.8, maxWidth: 360 }}>
          Something went wrong loading the site. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "24px",
            padding: "10px 24px",
            border: "1px solid #C9962E",
            borderRadius: "999px",
            background: "transparent",
            color: "#C9962E",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
