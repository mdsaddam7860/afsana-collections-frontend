"use client";

import { useMemo, useState } from "react";
import OrderRow from "@/components/admin/OrderRow";
import type { Order } from "@/types";

type SortDirection = "desc" | "asc";

// The backend's GET /admin/orders always returns createdAt desc (see
// order.routes.ts — orderBy: { createdAt: "desc" }, no sort param in
// its .strict() query schema at all), so there's no way to ask the
// backend for a different order. This sorts the already-fetched page
// client-side instead — fine at the pageSize this list fetches (20),
// but note it only re-sorts what's on the current page, not the full
// result set across pages.
export default function OrdersTable({
  orders,
  emptyMessage,
}: {
  orders: Order[];
  emptyMessage: string;
}) {
  const [sort, setSort] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "asc" ? diff : -diff;
    });
    return copy;
  }, [orders, sort]);

  const toggleSort = () => setSort((s) => (s === "desc" ? "asc" : "desc"));

  return (
    <div className="mt-8 rounded-soft border border-border md:overflow-x-auto">
      <div className="flex flex-col divide-y divide-border md:table md:w-full md:min-w-[760px] md:divide-y-0 md:text-left">
        <div className="hidden bg-surface font-mono-price text-[10px] uppercase tracking-widest text-muted md:table-header-group">
          <div className="md:table-row">
            <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Order</span>
            <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Payment</span>
            <span className="md:table-cell md:px-5 md:py-3 md:font-normal">
              <button
                type="button"
                onClick={toggleSort}
                className="inline-flex items-center gap-1 hover:text-accent"
                aria-label={`Sort by date, currently ${sort === "desc" ? "newest first" : "oldest first"}`}
              >
                Date
                <span aria-hidden="true">{sort === "desc" ? "↓" : "↑"}</span>
              </button>
            </span>
            <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Items</span>
            <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Total</span>
            <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Status</span>
            <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Returns</span>
          </div>
        </div>

        {/* Mobile-only sort control — the table header row above is
            hidden below md:, so the sort toggle needs its own visible
            spot on small screens rather than living inside a hidden
            header. */}
        <div className="flex items-center justify-end px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={toggleSort}
            className="inline-flex items-center gap-1 font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent"
          >
            Sort: {sort === "desc" ? "Newest first" : "Oldest first"}
            <span aria-hidden="true">{sort === "desc" ? "↓" : "↑"}</span>
          </button>
        </div>

        <div className="md:table-row-group">
          {sorted.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
          {sorted.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-muted md:table-row">
              <span className="md:table-cell md:py-6">{emptyMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
