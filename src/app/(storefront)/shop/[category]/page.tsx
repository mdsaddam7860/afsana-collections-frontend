import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductFilters from "@/components/product/ProductFilters";
import { getAllProducts } from "@/lib/api";
import { BRAND, CATEGORIES } from "@/lib/constants";

export const revalidate = 3600;

// Static params for the three known categories — Next.js will
// pre-render /shop/scrunchies, /shop/claw-clips, /shop/headbands at
// build time instead of generating them on first request.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.slug === params.category);
  if (!category) return {};
  const title = category.label;
  const description = `Shop ${category.label.toLowerCase()} from ${
    BRAND.name
  } — ${BRAND.tagline}`;
  return {
    title,
    description,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: { title, description, url: `/shop/${category.slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ShopCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = CATEGORIES.find((c) => c.slug === params.category);
  if (!category) notFound();

  const allProducts = await getAllProducts();
  // category.slug on a Product is nested under `category` (a full
  // {id, name, slug} object from the backend) — comparing the object
  // itself against a string always failed silently before.
  const products = allProducts.filter((p) => p.category.slug === category.slug);

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
        name: "Shop",
        item: `https://${BRAND.domain}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.label,
        item: `https://${BRAND.domain}/shop/${category.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
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
