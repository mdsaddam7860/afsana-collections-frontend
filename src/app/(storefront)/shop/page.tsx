import ProductFilters from "@/components/product/ProductFilters";
import { getAllProducts } from "@/lib/api";

export const revalidate = 3600;

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-8">
      <h1 className="font-display text-fluid-h1 italic text-foreground">All accessories</h1>
      <p className="mt-2 text-sm font-mono-price text-muted">
        {products.length} pieces
      </p>
      <div className="mt-8">
        <ProductFilters products={products} />
      </div>
    </div>
  );
}
