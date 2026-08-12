"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore, selectSubtotal } from "@/store/cart-store";
import { CHECKOUT_DEFAULTS, FEE_NOTES } from "@/lib/constants";
import { formatPrice } from "@/lib/currency";

// See CHECKOUT_DEFAULTS in lib/constants.ts for how to make delivery
// free: flip `freeShipping` to true for everyone, or set/adjust
// `freeShippingThreshold` for a spend-based free-delivery cutoff.
function getShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (CHECKOUT_DEFAULTS.freeShipping) return 0;
  if (
    CHECKOUT_DEFAULTS.freeShippingThreshold !== null &&
    subtotal >= CHECKOUT_DEFAULTS.freeShippingThreshold
  ) {
    return 0;
  }
  return CHECKOUT_DEFAULTS.flatShippingRate;
}

export default function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const [showShippingInfo, setShowShippingInfo] = useState(false);

  const tax = subtotal * CHECKOUT_DEFAULTS.taxRate;
  const shipping = getShipping(subtotal);
  const total = subtotal + tax + shipping;

  const amountToFreeShipping =
    !CHECKOUT_DEFAULTS.freeShipping &&
    CHECKOUT_DEFAULTS.freeShippingThreshold !== null &&
    subtotal > 0 &&
    subtotal < CHECKOUT_DEFAULTS.freeShippingThreshold
      ? CHECKOUT_DEFAULTS.freeShippingThreshold - subtotal
      : 0;

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
          <span className="inline-flex items-center gap-1">
            Delivery fee
            <button
              type="button"
              onClick={() => setShowShippingInfo((s) => !s)}
              aria-label="Why is there a delivery fee?"
              className="text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
            >
              (Why this?)
            </button>
          </span>
          <span className="text-foreground">
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        {showShippingInfo && (
          <p className="border-l-2 border-border pl-3 text-[11px] normal-case leading-relaxed text-muted">
            This covers what the courier actually charges us to pick up
            and deliver your order — we don&apos;t mark it up. It&apos;s
            waived automatically
            {CHECKOUT_DEFAULTS.freeShippingThreshold !== null
              ? ` on orders of ${formatPrice(CHECKOUT_DEFAULTS.freeShippingThreshold)} or more`
              : ""}
            .
          </p>
        )}
        {amountToFreeShipping > 0 && (
          <p className="text-[11px] normal-case text-accent">
            Add {formatPrice(amountToFreeShipping)} more for free delivery.
          </p>
        )}

        <div className="flex justify-between">
          <span>Tax (est.)</span>
          <span className="text-foreground">{formatPrice(tax)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm text-foreground">
        <span className="uppercase tracking-widest">Total</span>
        <span className="text-accent">{formatPrice(total)}</span>
      </div>

      {/* Not real line items — see FEE_NOTES in lib/constants.ts. This
          is reassurance copy, not billing, so it's deliberately styled
          quieter than the actual Subtotal/Delivery/Tax rows above. */}
      <div className="mt-4 space-y-1 border-t border-dashed border-border pt-4 text-[10px] normal-case text-muted">
        {FEE_NOTES.map((fee) => (
          <div key={fee.label} className="flex justify-between">
            <span>{fee.label}</span>
            <span>{fee.note}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-1 border-t border-dashed border-border pt-4 text-[10px] text-muted">
        {"· · · · · · · · · · · · · · · · · · · · · ·"}
      </div>
    </div>
  );
}
