"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types";

const SWATCH_HEX: Record<string, string> = {
  Blush: "#D8A79B",
  Cream: "#E9DCC4",
  Plum: "#5A3A52",
  "Gold Fleck": "#C9962E",
  Tortoise: "#6B4A2A",
};

export default function VariantSelector({ product }: { product: Product }) {
  const [selected, setSelected] = useState(product.variants[0]);
  const [added, setAdded] = useState(false);
  const [pressed, setPressed] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const outOfStock = selected.inventory === 0;

  const handleAdd = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    addItem({
      productId: product.id,
      variantId: selected.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <p className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
        Color — {selected.color}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {product.variants.map((variant) => {
          const active = selected.id === variant.id;
          return (
            <button
              key={variant.id}
              onClick={() => setSelected(variant)}
              disabled={variant.inventory === 0}
              aria-label={variant.color}
              className={`relative h-10 w-10 rounded-full transition-transform duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
                active ? "scale-110" : "hover:scale-105"
              }`}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: SWATCH_HEX[variant.color] ?? "#666" }}
              />
              {active && (
                <span className="absolute -inset-1.5 rounded-full border border-accent" />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className={`btn-fill mt-8 w-full rounded-sharp border border-accent py-4 font-mono-price text-xs uppercase tracking-widest text-foreground transition-all duration-150 hover:text-accent-foreground disabled:cursor-not-allowed disabled:border-border disabled:opacity-30 ${
          pressed ? "scale-[0.98]" : "scale-100"
        }`}
      >
        {outOfStock ? "Sold out" : added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
