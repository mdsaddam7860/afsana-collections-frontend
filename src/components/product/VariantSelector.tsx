"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
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

  const outOfStock = selected.stockQuantity === 0;
  const price = Number(product.basePrice) + Number(selected.priceAdjustment);

  const handleAdd = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    addItem({
      productId: product.id,
      variantId: selected.id,
      name: product.name,
      price,
      image: product.images[0],
      quantity: 1,
    });
    toast.success(`${product.name} added to bag`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <p className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
        {selected.attributes.color
          ? `Color — ${selected.attributes.color}`
          : selected.variantName}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {product.variants.map((variant) => {
          const active = selected.id === variant.id;
          const label = variant.attributes.color ?? variant.variantName;
          return (
            <button
              key={variant.id}
              onClick={() => setSelected(variant)}
              disabled={variant.stockQuantity === 0}
              aria-label={label}
              className={`relative h-10 w-10 rounded-full transition-transform duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
                active ? "scale-110" : "hover:scale-105"
              }`}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: SWATCH_HEX[label] ?? "#666" }}
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
