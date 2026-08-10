"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/currency";
import { cldUrl } from "@/lib/cloudinary";

export default function WishlistCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleSaved = useWishlistStore((s) => s.toggle);
  const defaultVariant = product.variants[0];

  return (
    <div
      className="stagger-in group relative"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-soft bg-surface shadow-hairline">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={cldUrl(product.images[0])}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="img-zoom object-cover"
          />
        </Link>
        <button
          onClick={() => toggleSaved(product.id)}
          aria-label="Remove from wishlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-accent backdrop-blur transition-transform hover:scale-110"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-sm italic text-foreground">{product.name}</p>
          <p className="mt-0.5 font-mono-price text-[10px] uppercase tracking-wider text-muted">
            {product.material}
          </p>
        </div>
        <p className="font-mono-price whitespace-nowrap text-sm text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>

      <button
        onClick={() =>
          addItem({
            productId: product.id,
            variantId: defaultVariant.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            quantity: 1,
          })
        }
        className="btn-fill mt-3 w-full rounded-sharp border border-border py-2.5 font-mono-price text-[11px] uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-foreground"
      >
        Move to bag
      </button>
    </div>
  );
}
