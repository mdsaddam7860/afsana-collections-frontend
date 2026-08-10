import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { getFeaturedProducts } from "@/lib/api";

// Static at build time; revalidates hourly so new drops show without a redeploy.
export const revalidate = 3600;

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts products={featured} />
    </>
  );
}
