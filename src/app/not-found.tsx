import Link from "next/link";

// Next.js renders this for any unmatched route automatically (and
// wherever notFound() is called, e.g. product/[slug]/page.tsx).
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 pb-24 pt-40 text-center">
      <p className="font-mono-price text-xs uppercase tracking-widest text-muted">
        404
      </p>
      <h1 className="mt-3 font-display text-fluid-h1 italic text-foreground">
        Nothing here
      </h1>
      <p className="mt-4 text-sm text-muted">
        The page you're looking for doesn't exist, or the piece may have sold
        out and moved on.
      </p>
      <Link
        href="/"
        className="btn-fill mt-8 rounded-pill border border-accent px-6 py-2.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground"
      >
        Back to Afsana Collections
      </Link>
    </div>
  );
}
