import Link from "next/link";

export default function OrderConfirmed({
  orderNumber,
}: {
  orderNumber: string;
}) {
  return (
    <div className="stagger-in flex flex-col items-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent text-accent">
        ✓
      </div>
      <h2 className="font-display text-fluid-h2 mt-6 italic text-foreground">
        Order confirmed.
      </h2>
      <p className="mt-3 font-mono-price text-xs uppercase tracking-widest text-muted">
        #{orderNumber}
      </p>
      <p className="mt-5 max-w-sm text-sm text-muted">
        We've sent a confirmation to your email. Your bag is on its way to being
        on its way.
      </p>
      <Link
        href="/shop"
        className="btn-fill mt-8 rounded-pill border border-accent px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:text-accent-foreground"
      >
        Continue shopping
      </Link>
    </div>
  );
}
