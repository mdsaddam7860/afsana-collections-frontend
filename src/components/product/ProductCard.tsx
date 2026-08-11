"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { toast } from "@/store/toast-store";
import { formatPrice } from "@/lib/currency";
import { cldUrl } from "@/lib/cloudinary";
import type { Product } from "@/types";

// Maps a variant color name to a backdrop tint so each card reads as an
// object on a matching surface, not a photo floating on blank space.
const BACKDROP_BY_COLOR: Record<string, string> = {
  Blush: "bg-[#3D2A2E]",
  Cream: "bg-[#332B23]",
  Plum: "bg-[#2A1E2C]",
  "Gold Fleck": "bg-[#332812]",
  Tortoise: "bg-[#2B2419]",
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isSaved = useWishlistStore((s) => s.isSaved(product.id));
  const toggleSaved = useWishlistStore((s) => s.toggle);

  const defaultVariant = product.variants[0];
  const inStock = product.variants.some((v) => v.stockQuantity > 0);
  const backdrop =
    BACKDROP_BY_COLOR[defaultVariant.attributes.color ?? ""] ?? "bg-surface";

  return (
    <div
      className="stagger-in group relative flex flex-col"
      style={{ animationDelay: `${index * 0.08}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/product/${product.slug}`}
        className={`relative block aspect-[3/4] overflow-hidden rounded-soft ${backdrop} shadow-hairline transition-shadow duration-500 group-hover:shadow-lift`}
      >
        <Image
          src={cldUrl(product.images[0])}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={`img-zoom object-cover transition-opacity duration-500 ${
            hovered && product.images[1] ? "opacity-0" : "opacity-100"
          }`}
        />
        {product.images[1] && (
          <Image
            src={cldUrl(product.images[1])}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`img-zoom object-cover transition-opacity duration-500 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* isNew was never a real backend field — dropping the badge
            rather than inventing a "new" heuristic (e.g. createdAt age)
            the product data doesn't actually support yet. */}
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70 font-mono-price text-xs uppercase tracking-widest text-foreground">
            Sold out
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => {
          toggleSaved(product.id);
          toast.success(
            isSaved ? "Removed from wishlist" : "Saved to wishlist"
          );
        }}
        aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 backdrop-blur transition-all hover:scale-110 ${
          isSaved ? "text-accent" : "text-foreground/70"
        }`}
      >
        {isSaved ? "♥" : "♡"}
      </button>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/product/${product.slug}`}
            className="font-display text-base italic text-foreground transition-colors hover:text-accent"
          >
            {product.name}
          </Link>
          <p className="mt-1 font-mono-price text-[11px] uppercase tracking-wider text-muted">
            {defaultVariant.attributes.material ?? product.category.name}
          </p>
        </div>
        <p className="font-mono-price whitespace-nowrap text-sm text-foreground">
          {formatPrice(
            Number(product.basePrice) + Number(defaultVariant.priceAdjustment)
          )}
        </p>
      </div>

      <button
        type="button"
        disabled={!inStock || added}
        onClick={() => {
          addItem({
            productId: product.id,
            variantId: defaultVariant.id,
            name: product.name,
            price:
              Number(product.basePrice) +
              Number(defaultVariant.priceAdjustment),
            image: product.images[0],
            quantity: 1,
          });
          toast.success(`${product.name} added to bag`);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="btn-fill mt-4 w-full rounded-sharp border border-border py-3 font-mono-price text-[11px] uppercase tracking-widest text-foreground transition-colors duration-300 hover:border-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-30"
      >
        {!inStock ? "Notify me" : added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
