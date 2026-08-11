import ProductCardSkeleton from "./ProductCardSkeleton";

// Matches the grid classes used on the homepage's FeaturedProducts,
// shop/[category], and search/filter results — 2 cols mobile, 3 sm,
// 4 lg, matching each caller's actual breakpoints via the `cols` prop.
export default function ProductGridSkeleton({
  count = 8,
  cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid gap-x-5 gap-y-10 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
