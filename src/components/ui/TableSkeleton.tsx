import Skeleton from "./Skeleton";

// Generic row-based skeleton for admin tables (Inventory, Orders,
// Discounts) — column widths are approximate, just enough to read as
// "a table is loading" without needing per-page bespoke versions.
export default function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-soft border border-border">
      <div className="border-b border-border bg-surface px-5 py-3">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex gap-6 border-b border-border px-5 py-4 last:border-0"
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 w-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
