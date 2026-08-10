"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/currency";

// INR ceiling for the price slider — was a $60 USD cap; scaled to a
// sensible rupee range for this catalog. Adjust once real product
// prices are loaded from the backend.
const PRICE_MAX = 3000;

export default function ProductFilters({ products }: { products: Product[] }) {
  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);

  const allMaterials = useMemo(
    () => Array.from(new Set(products.map((p) => p.material))),
    [products]
  );
  const allColors = useMemo(
    () =>
      Array.from(new Set(products.flatMap((p) => p.variants.map((v) => v.color)))),
    [products]
  );

  const filtered = products.filter((p) => {
    const matchesMaterial =
      materials.length === 0 || materials.includes(p.material);
    const matchesColor =
      colors.length === 0 || p.variants.some((v) => colors.includes(v.color));
    const matchesPrice = p.price <= maxPrice;
    return matchesMaterial && matchesColor && matchesPrice;
  });

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const Chip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-pill border px-4 py-2 font-mono-price text-[11px] uppercase tracking-widest transition-all duration-300 ${
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border text-muted hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-2">
        {allMaterials.map((m) => (
          <Chip
            key={m}
            active={materials.includes(m)}
            onClick={() => toggle(materials, m, setMaterials)}
          >
            {m}
          </Chip>
        ))}
        <span className="mx-1 w-px shrink-0 self-stretch bg-border" />
        {allColors.map((c) => (
          <Chip
            key={c}
            active={colors.includes(c)}
            onClick={() => toggle(colors, c, setColors)}
          >
            {c}
          </Chip>
        ))}
        <span className="mx-1 w-px shrink-0 self-stretch bg-border" />
        <div className="flex shrink-0 items-center gap-3 rounded-pill border border-border px-4 py-2">
          <label htmlFor="price" className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
            Under {formatPrice(maxPrice)}
          </label>
          <input
            id="price"
            type="range"
            min={0}
            max={PRICE_MAX}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-24 accent-accent"
          />
        </div>
      </div>

      <div className="mt-10">
        {filtered.length === 0 ? (
          <p className="font-mono-price text-sm text-muted">
            No pieces match those filters yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
