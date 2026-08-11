import Skeleton from "./Skeleton";

// Mirrors ProductCard.tsx's layout exactly (aspect-[3/4] image, name line,
// price line) so swapping skeleton -> real card causes zero layout shift.
export default function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full rounded-soft" />
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="w-2/3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-12 shrink-0" />
      </div>
    </div>
  );
}
