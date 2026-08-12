import { getServerSession } from "next-auth";
import { getAdminProducts, getAllOrders } from "@/lib/admin-api";
import { authOptions } from "@/lib/auth";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-soft border border-border bg-surface p-6">
      <p className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="font-display mt-3 text-3xl italic text-foreground">
        {value}
      </p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  const accessToken =
    (session as unknown as { accessToken?: string })?.accessToken ?? "";
  const [products, orders, codPending] = await Promise.all([
    getAdminProducts(accessToken),
    getAllOrders(accessToken),
    // Separate call rather than filtering `orders` client-side — that
    // list is only the first page (20), which would undercount COD
    // orders awaiting collection once there's more than a page of
    // orders. This one asks the backend for the real total instead.
    getAllOrders(accessToken, { codPendingCollection: true }),
  ]);

  const activeProducts = products.filter((p) => p.status === "ACTIVE");
  const lowStock = activeProducts.flatMap((p) =>
    p.variants.filter((v) => v.stockQuantity > 0 && v.stockQuantity <= 5)
  ).length;
  const outOfStock = activeProducts.flatMap((p) =>
    p.variants.filter((v) => v.stockQuantity === 0)
  ).length;

  // Status matching is case-insensitive against the locked OrderStatus
  // set (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED) — see
  // src/types/index.ts.
  const byStatus = (...statuses: string[]) =>
    orders.filter((o) => statuses.includes(o.status.toLowerCase())).length;

  const pendingOrders = byStatus("pending");
  const shippedOrders = byStatus("shipped");
  const deliveredOrders = byStatus("delivered");
  const cancelledOrders = byStatus("cancelled");
  const returnsRequested = orders.filter(
    (o) => o.returnStatus === "REQUESTED"
  ).length;

  return (
    <div>
      <h1 className="font-display text-fluid-h1 italic text-foreground">
        Overview
      </h1>
      <p className="mt-2 text-sm text-muted">
        {orders.length} total orders across all customers, {products.length}{" "}
        products total (drafts and archived included) — see Inventory below.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Active products" value={String(activeProducts.length)} />
        <StatCard label="Low stock" value={String(lowStock)} />
        <StatCard label="Out of stock" value={String(outOfStock)} />
        <StatCard label="Pending orders" value={String(pendingOrders)} />
        <StatCard label="Shipped" value={String(shippedOrders)} />
        <StatCard label="Delivered" value={String(deliveredOrders)} />
        <StatCard label="Cancelled" value={String(cancelledOrders)} />
        <StatCard label="Returns requested" value={String(returnsRequested)} />
      </div>

      {codPending.length > 0 && (
        <a
          href="/admin/orders?cod=1"
          className="mt-5 flex items-center justify-between rounded-soft border border-accent/50 bg-accent/5 px-6 py-4 transition-colors hover:bg-accent/10"
        >
          <span className="font-mono-price text-xs uppercase tracking-widest text-foreground">
            {codPending.length} COD {codPending.length === 1 ? "order" : "orders"}{" "}
            awaiting cash collection
          </span>
          <span className="font-mono-price text-xs uppercase tracking-widest text-accent">
            View →
          </span>
        </a>
      )}

      <p className="mt-6 text-xs text-muted">
        Manage stock in{" "}
        <a href="/admin/products" className="text-accent hover:opacity-70">
          Inventory
        </a>
        , review every order and approve returns in{" "}
        <a href="/admin/orders" className="text-accent hover:opacity-70">
          Orders
        </a>
        .
      </p>
    </div>
  );
}
