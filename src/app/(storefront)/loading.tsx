import Skeleton from "@/components/ui/Skeleton";
import ProductGridSkeleton from "@/components/ui/ProductGridSkeleton";

// Covers the (storefront) group's index route while HomePage's
// getFeaturedProducts() call resolves. Mirrors HeroSection + CategoryGrid
// + FeaturedProducts' actual layout so there's no shift once real
// content streams in.
export default function Loading() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 pt-32">
        <Skeleton className="h-[50vh] w-full rounded-soft" />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-soft" />
          ))}
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6">
          <ProductGridSkeleton cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
        </div>
      </section>
    </>
  );
}
