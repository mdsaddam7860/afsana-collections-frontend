import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { getFeaturedProducts } from "@/lib/api";
import { BRAND, SEO } from "@/lib/constants";

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.description,
  },
};

// Static at build time; revalidates hourly so new drops show without a redeploy.
export const revalidate = 3600;

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: `https://${BRAND.domain}`,
    logo: `https://${BRAND.domain}/icons/icon-192.png`,
    email: BRAND.supportEmail,
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: `https://${BRAND.domain}`,
    potentialAction: {
      "@type": "SearchAction",
      target: `https://${BRAND.domain}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts products={featured} />
    </>
  );
}
