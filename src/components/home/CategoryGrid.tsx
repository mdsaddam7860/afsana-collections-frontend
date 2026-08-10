import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { cldUrl } from "@/lib/cloudinary";

// Image names live here, not in lib/constants.ts, since they're asset
// references tied to Cloudinary rather than brand copy — but the slug/label
// pairs are shared with Navbar and Footer via CATEGORIES. Resolved to a
// full URL via cldUrl() from lib/cloudinary.ts.
const CATEGORY_IMAGES: Record<string, string> = {
  scrunchies: "cat-scrunchies.jpg",
  "claw-clips": "cat-claws.jpg",
  headbands: "cat-headbands.jpg",
};

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <h2 className="font-display text-fluid-h2 italic text-foreground">
        Shop by category
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/shop/${cat.slug}`}
            className="stagger-in group relative aspect-[4/5] overflow-hidden rounded-soft shadow-hairline"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <Image
              src={cldUrl(CATEGORY_IMAGES[cat.slug])}
              alt={cat.label}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="img-zoom object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            <span className="absolute bottom-5 left-5 font-display text-lg italic text-foreground">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
