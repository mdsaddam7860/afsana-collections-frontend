// Base shimmer block. All other skeleton compositions (ProductCardSkeleton,
// ProductGridSkeleton, etc.) are built from this — keep those in the same
// `ui/` folder so there's exactly one shimmer animation/definition to tune.
export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sharp bg-surface-raised ${className}`}
    />
  );
}
