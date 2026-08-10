import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import VariantSelector from "@/components/product/VariantSelector";
import ReviewsSection from "@/components/product/ReviewsSection";
import { getAllProducts, getProductBySlug } from "@/lib/api";
import { formatPrice } from "@/lib/currency";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pb-20 pt-32 md:grid-cols-2 lg:px-8">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <h1 className="font-display text-fluid-h1 italic text-foreground">{product.name}</h1>
          <p className="mt-2 text-lg font-mono-price text-muted">
            {formatPrice(product.price)}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-fluid-body text-muted">
            {product.description}
          </p>

          <div className="mt-8">
            <VariantSelector product={product} />
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} />
    </>
  );
}
