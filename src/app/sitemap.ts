import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/api";
import { CATEGORIES, SITE_URL } from "@/lib/constants";

// Public, crawlable routes only — /admin, /account, /checkout, and auth
// pages are intentionally excluded (see their noindex metadata + robots.ts).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
        ...CATEGORIES.map((c) => ({
            url: `${SITE_URL}/shop/${c.slug}`,
            changeFrequency: "daily" as const,
            priority: 0.8,
        })),
    ];

    // Product listing can fail (backend down, etc.) — a broken sitemap
    // build shouldn't take the rest of the site down with it, so this
    // degrades to the static routes only rather than throwing.
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const products = await getAllProducts();
        productRoutes = products.map((p) => ({
            url: `${SITE_URL}/product/${p.slug}`,
            lastModified: p.createdAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch {
        // fall through with static routes only
    }

    return [...staticRoutes, ...productRoutes];
}