import { getServerSession } from "next-auth";
import OrderRow from "@/components/admin/OrderRow";
import { getAllOrders } from "@/lib/admin-api";
import { authOptions } from "@/lib/auth";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  const accessToken =
    (session as unknown as { accessToken?: string })?.accessToken ?? "";
  const orders = await getAllOrders(accessToken);

  return (
    <div>
      <h1 className="font-display text-fluid-h1 italic text-foreground">
        Orders
      </h1>
      <p className="mt-2 text-sm text-muted">{orders.length} orders</p>

      <div className="mt-8 overflow-hidden rounded-soft border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-surface font-mono-price text-[10px] uppercase tracking-widest text-muted">
              <th className="px-5 py-3 font-normal">Order</th>
              <th className="px-5 py-3 font-normal">Date</th>
              <th className="px-5 py-3 font-normal">Items</th>
              <th className="px-5 py-3 font-normal">Total</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Returns</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
