import { getServerSession } from "next-auth";
import OrderRow from "@/components/admin/OrderRow";
import OrderStatusFilter from "@/components/admin/OrderStatusFilter";
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
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  const accessToken =
    (session as unknown as { accessToken?: string })?.accessToken ?? "";
  const status = searchParams.status;
  const orders = await getAllOrders(accessToken, status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-fluid-h1 italic text-foreground">
            Orders
          </h1>
          <p className="mt-2 text-sm text-muted">
            {orders.length} orders{status ? ` · ${status}` : ""}
          </p>
        </div>
        <OrderStatusFilter statuses={STATUS_OPTIONS} current={status} />
      </div>

      <div className="mt-8 rounded-soft border border-border md:overflow-x-auto">
        <div className="flex flex-col divide-y divide-border md:table md:w-full md:min-w-[720px] md:divide-y-0 md:text-left">
          <div className="hidden bg-surface font-mono-price text-[10px] uppercase tracking-widest text-muted md:table-header-group">
            <div className="md:table-row">
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Order</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Date</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Items</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Total</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Status</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Returns</span>
            </div>
          </div>
          <div className="md:table-row-group">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            {orders.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-muted md:table-row">
                <span className="md:table-cell md:py-6">
                  No orders{status ? ` with status ${status}` : ""}.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
