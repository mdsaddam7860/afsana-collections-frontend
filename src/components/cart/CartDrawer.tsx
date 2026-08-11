"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore, selectSubtotal } from "@/store/cart-store";
import { formatPrice } from "@/lib/currency";
import EmptyState from "@/components/ui/EmptyState";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore(selectSubtotal);

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className={`glass-panel fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-ambient transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-lg italic">Your bag</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="font-mono-price text-xs uppercase tracking-widest text-muted hover:text-accent"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <EmptyState
              title="Your bag is empty"
              description="Pieces you add will show up here."
              action={
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="font-mono-price text-[11px] uppercase tracking-widest text-accent underline underline-offset-2"
                >
                  Start shopping
                </Link>
              }
            />
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-soft bg-surface-raised">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between text-sm">
                      <span className="font-display italic">{item.name}</span>
                      <span className="font-mono-price">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono-price text-xs text-muted">
                      <label
                        htmlFor={`qty-${item.variantId}`}
                        className="sr-only"
                      >
                        Quantity for {item.name}
                      </label>
                      <select
                        id={`qty-${item.variantId}`}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.variantId, Number(e.target.value))
                        }
                        className="rounded-sharp border border-border bg-transparent px-2 py-1"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n} className="bg-surface">
                            {n}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="underline underline-offset-2 hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-6 py-5">
          <div className="flex justify-between font-mono-price text-sm">
            <span className="uppercase tracking-widest text-muted">
              Subtotal
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Shipping and taxes calculated at checkout.
          </p>
          <Link
            href="/checkout"
            onClick={closeCart}
            className={`btn-fill mt-4 block w-full rounded-sharp border border-accent py-3.5 text-center font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground ${
              items.length === 0 ? "pointer-events-none opacity-30" : ""
            }`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
