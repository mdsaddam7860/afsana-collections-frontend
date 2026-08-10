import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
      <h2 className="font-display text-fluid-h2 italic text-foreground">
        Best sellers
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
