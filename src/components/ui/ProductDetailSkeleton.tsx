import Skeleton from "./Skeleton";

// Mirrors product/[slug]/page.tsx's grid: aspect-square gallery on the
// left (ProductGallery.tsx), name/price/description/variants on the
// right — used by product/[slug]/loading.tsx.
export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pb-20 pt-32 md:grid-cols-2 lg:px-8">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div>
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="mt-3 h-5 w-24" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-8 flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-8 h-14 w-full rounded-sharp" />
      </div>
    </div>
  );
}
