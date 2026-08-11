import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import VariantSelector from "@/components/product/VariantSelector";
import ReviewsSection from "@/components/product/ReviewsSection";
import { getAllProducts, getProductBySlug } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { BRAND } from "@/lib/constants";
import { cldUrl } from "@/lib/cloudinary";
import { CURRENCY_CODE } from "@/lib/currency";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const title = product.name;
  // Real product copy for description when present; falls back to a
  // generated line rather than leaving it blank, since every page needs
  // a unique description per the SEO requirement (no generic/duplicate
  // descriptions across products).
  const description =
    product.description ??
    `${product.name} from ${BRAND.name} — ${
      product.category.name
    }, ${formatPrice(Number(product.basePrice))}.`;
  const image = product.images[0] ? cldUrl(product.images[0]) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${product.slug}`,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const inStock = product.variants.some((v) => v.stockQuantity > 0);
  const price =
    Number(product.basePrice) +
    Number(product.variants[0]?.priceAdjustment ?? 0);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((img) => cldUrl(img)),
    brand: { "@type": "Brand", name: BRAND.name },
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "Offer",
      url: `https://${BRAND.domain}/product/${product.slug}`,
      priceCurrency: CURRENCY_CODE,
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://${BRAND.domain}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: `https://${BRAND.domain}/shop/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://${BRAND.domain}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pb-20 pt-32 md:grid-cols-2 lg:px-8">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <h1 className="font-display text-fluid-h1 italic text-foreground">
            {product.name}
          </h1>
          <p className="mt-2 text-lg font-mono-price text-muted">
            {formatPrice(Number(product.basePrice))}
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
