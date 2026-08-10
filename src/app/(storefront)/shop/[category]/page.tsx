import { notFound } from "next/navigation";
import ProductFilters from "@/components/product/ProductFilters";
import { getAllProducts } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";

export const revalidate = 3600;

// Static params for the three known categories — Next.js will
// pre-render /shop/scrunchies, /shop/claw-clips, /shop/headbands at
// build time instead of generating them on first request.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function ShopCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = CATEGORIES.find((c) => c.slug === params.category);
  if (!category) notFound();

  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.category === category.slug);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-8">
      <h1 className="font-display text-fluid-h1 italic text-foreground">
        {category.label}
      </h1>
      <p className="mt-2 text-sm font-mono-price text-muted">
        {products.length} pieces
      </p>
      <div className="mt-8">
        <ProductFilters products={products} />
      </div>
    </div>
  );
}
