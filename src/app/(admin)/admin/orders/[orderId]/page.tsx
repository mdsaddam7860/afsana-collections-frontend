import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getOrderById } from "@/lib/admin-api";
import { authOptions } from "@/lib/auth";
import { formatOrderAmount } from "@/lib/currency";
import ShippingAddressCard from "@/components/admin/ShippingAddressCard";
import OrderStatusControl from "@/components/admin/OrderStatusControl";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const session = await getServerSession(authOptions);
  const accessToken =
    (session as unknown as { accessToken?: string })?.accessToken ?? "";
  const order = await getOrderById(params.orderId, accessToken);

  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent"
      >
        ← All orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-fluid-h1 italic text-foreground">
            Order #{order.id}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Placed {new Date(order.createdAt).toLocaleString()} ·{" "}
            {order.paymentMethod}
            {order.paymentMethod === "COD" && (
              <>
                {" · "}
                <span className={order.paidAt ? "text-muted" : "text-accent"}>
                  {order.paidAt
                    ? `Cash collected ${new Date(order.paidAt).toLocaleString()}`
                    : "Cash pending"}
                </span>
              </>
            )}
          </p>
        </div>
        <OrderStatusControl
          orderId={order.id}
          status={order.status}
          paymentMethod={order.paymentMethod}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="rounded-soft border border-border">
          <div className="border-b border-border px-5 py-3 font-mono-price text-[10px] uppercase tracking-widest text-muted">
            Items
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
              >
                <div>
                  <p className="text-foreground">{item.productName}</p>
                  <p className="mt-0.5 font-mono-price text-xs text-muted">
                    {item.variantName} · SKU {item.sku} · Qty {item.quantity}
                  </p>
                </div>
                <span className="font-mono-price text-foreground">
                  {formatOrderAmount(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-border px-5 py-4 font-mono-price text-xs text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-foreground">{formatOrderAmount(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span className="text-foreground">
                {order.shippingAmount === 0 ? "Free" : formatOrderAmount(order.shippingAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="text-foreground">{formatOrderAmount(order.taxAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-accent">-{formatOrderAmount(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 text-sm text-foreground">
              <span>Total</span>
              <span>{formatOrderAmount(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping / fulfillment — this is the piece that answers
            "how do I actually ship this order": full destination
            address plus a one-click copy for pasting into a courier's
            label form. */}
        <div className="space-y-6">
          <ShippingAddressCard address={order.shippingAddress} orderId={order.id} />

          {order.billingAddress &&
            JSON.stringify(order.billingAddress) !== JSON.stringify(order.shippingAddress) && (
              <div className="rounded-soft border border-border p-5">
                <p className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                  Billing address
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {order.billingAddress.fullName}
                  <br />
                  {order.billingAddress.street}
                  {order.billingAddress.addressLine2 && (
                    <>
                      <br />
                      {order.billingAddress.addressLine2}
                    </>
                  )}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.state}{" "}
                  {order.billingAddress.postalCode}
                  <br />
                  {order.billingAddress.country}
                </p>
              </div>
            )}

          {order.returnStatus && (
            <div className="rounded-soft border border-border p-5">
              <p className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                Return
              </p>
              <p className="mt-2 text-sm text-foreground">{order.returnStatus}</p>
              {order.returnReason && (
                <p className="mt-1 text-sm text-muted">{order.returnReason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
