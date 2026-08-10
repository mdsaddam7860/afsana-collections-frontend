"use client";

import Image from "next/image";
import { useCartStore, selectSubtotal } from "@/store/cart-store";
import { CHECKOUT_DEFAULTS } from "@/lib/constants";
import { formatPrice } from "@/lib/currency";

export default function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const tax = subtotal * CHECKOUT_DEFAULTS.taxRate;
  const shipping = subtotal > 0 ? CHECKOUT_DEFAULTS.flatShippingRate : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="rounded-soft border border-dashed border-border bg-surface p-6 font-mono-price">
      <p className="text-[11px] uppercase tracking-widest text-muted">
        Order summary
      </p>

      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-soft bg-surface-raised">
              <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-1 items-baseline justify-between text-xs">
              <span className="font-body text-foreground">
                {item.name} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-dashed border-border pt-4 text-xs text-muted">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-foreground">{formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (est.)</span>
          <span className="text-foreground">{formatPrice(tax)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm text-foreground">
        <span className="uppercase tracking-widest">Total</span>
        <span className="text-accent">{formatPrice(total)}</span>
      </div>

      <div className="mt-6 flex justify-center gap-1 border-t border-dashed border-border pt-4 text-[10px] text-muted">
        {"· · · · · · · · · · · · · · · · · · · · · ·"}
      </div>
    </div>
  );
}
