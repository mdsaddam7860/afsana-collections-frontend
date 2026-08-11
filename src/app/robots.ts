import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Private/sensitive routes, backed up by per-route noindex
            // metadata (see (admin)/layout.tsx, account/layout.tsx,
            // checkout/layout.tsx) — listed here too as a second layer, since
            // robots.txt disallow and a noindex meta tag serve different
            // purposes (disallow keeps crawlers from even requesting the
            // page; noindex works only if they're allowed to fetch it).
            disallow: ["/admin", "/account", "/checkout", "/api"],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}