import Link from "next/link";
import { getServerSession } from "next-auth";
import OrderStatusFilter from "@/components/admin/OrderStatusFilter";
import OrdersTable from "@/components/admin/OrdersTable";
import { getAllOrders } from "@/lib/admin-api";
import { authOptions } from "@/lib/auth";

// PATCH /admin/orders/:id/status only accepts these three as a target,
// but an order can also sit in any of the others — offered here as
// read-only filters, not just PATCH targets.
const STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; cod?: string };
}) {
  const session = await getServerSession(authOptions);
  const accessToken =
    (session as unknown as { accessToken?: string })?.accessToken ?? "";
  const status = searchParams.status;
  // ?cod=1 maps to GET /admin/orders?codPendingCollection=true — every
  // COD order whose cash hasn't been collected yet (paidAt still null).
  // Probably the single most useful day-to-day view for running COD:
  // "how much am I owed right now, and from whom."
  const codPendingCollection = searchParams.cod === "1";
  const orders = await getAllOrders(accessToken, { status, codPendingCollection });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-fluid-h1 italic text-foreground">
            Orders
          </h1>
          <p className="mt-2 text-sm text-muted">
            {orders.length} orders
            {codPendingCollection ? " · COD awaiting collection" : status ? ` · ${status}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={codPendingCollection ? "/admin/orders" : "/admin/orders?cod=1"}
            className={`rounded-pill border px-4 py-2 font-mono-price text-xs uppercase tracking-widest transition-colors ${
              codPendingCollection
                ? "border-accent bg-accent text-accent-foreground"
                : "border-accent/50 text-accent hover:bg-accent/10"
            }`}
          >
            COD — Awaiting collection
          </Link>
          <OrderStatusFilter statuses={STATUS_OPTIONS} current={status} disabled={codPendingCollection} />
        </div>
      </div>

      <OrdersTable
        orders={orders}
        emptyMessage={
          codPendingCollection
            ? "No COD orders awaiting collection."
            : `No orders${status ? ` with status ${status}` : ""}.`
        }
      />
    </div>
  );
}
