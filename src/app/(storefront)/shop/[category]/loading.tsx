import Skeleton from "@/components/ui/Skeleton";
import ProductGridSkeleton from "@/components/ui/ProductGridSkeleton";

// Mirrors shop/[category]/page.tsx's header + ProductFilters + grid.
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-2 h-4 w-24" />
      <div className="mt-8 flex gap-2.5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-pill" />
        ))}
      </div>
      <div className="mt-10">
        <ProductGridSkeleton cols="grid-cols-2 sm:grid-cols-3" />
      </div>
    </div>
  );
}
