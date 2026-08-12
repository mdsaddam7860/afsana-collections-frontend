/**
 * Everything in this file is brand/client-specific — the values you'd
 * change when reusing this codebase for a different store. Nothing here
 * is business logic; it's copy, contact info, and category config.
 *
 * Wired into: metadata (SEO title/description), Navbar, Footer, Hero,
 * category grid/filters, and the login/signup side panels.
 *
 * When onboarding a new client: edit this file top to bottom, swap the
 * images referenced in /public/images, and adjust the palette in
 * globals.css / theme.config.ts. You shouldn't need to touch component
 * code for a standard rebrand.
 */

export const BRAND = {
  name: "Afsana Collections",
  // Components style the second word in accent color rather than
  // hardcoding an ampersand between two names (no "&" in this brand).
  nameParts: { first: "Afsana", second: "Collections" },
  tagline: "Hair, held beautifully.",
  domain: "afsanacollections.com",
  supportEmail: "hello@afsanacollections.com",
};

export const SEO = {
  title: `${BRAND.name} — Hair Accessories`,
  description:
    "Oversized silk scrunchies, acetate claw clips, and cotton headbands.",
};

// Canonical origin for metadataBase, canonical URLs, Open Graph images,
// sitemap.ts, and JSON-LD. Falls back to the brand's real domain so
// production builds are correct even if the env var is missed, but a
// local/staging deploy should set NEXT_PUBLIC_SITE_URL to its own origin
// (e.g. http://localhost:3000) or Open Graph/canonical URLs will point
// at the production domain instead.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;

export const HERO_CONTENT = {
  eyebrow: "Fall drop / 02",
  headlineLine1: "Hair, held",
  headlineLine2: "beautifully.",
  body: "Oversized silk scrunchies, acetate claw clips, and cotton headbands — made to hold, not tug. Gentle on strands, styled for everyday.",
  primaryCta: { label: "Shop the edit", href: "/shop" },
  secondaryCta: { label: "Best sellers", href: "/shop/scrunchies" },
};

// Drives Navbar links, CategoryGrid, and the material/color facets
// ProductFilters reads from products — this list is just navigation and
// category-page routing, not the product data itself (that stays in
// lib/api.ts).
export const CATEGORIES = [
  { slug: "scrunchies", label: "Scrunchies" },
  { slug: "claw-clips", label: "Claw Clips" },
  { slug: "headbands", label: "Headbands" },
] as const;

export const FOOTER_CONTENT = {
  newsletterHeadline: { line1: "Hold", line2: "on." },
  newsletterBody:
    "Ten percent off your first order, and first look at new drops.",
  supportLinks: ["Shipping", "Returns", "Contact"],
  closingLine: "Made for hair that moves.",
};

export const AUTH_CONTENT = {
  login: {
    headline: { line1: "Welcome", line2: "back." },
    body: "Your orders, your wishlist, and early access to new drops — right where you left them.",
  },
  signup: {
    headline: { line1: "Join", line2: "the fold." },
    body: "Ten percent off your first order, saved wishlists, and first look at new drops.",
  },
};

// Shipping/tax assumptions used in the checkout OrderSummary — these are
// placeholder flat rates. Replace with real shipping-rate and tax-rate
// lookups (by address/carrier) before going live.
//
// currency is sent as-is in the POST /orders body and
// POST /payments/create-intent flow (see lib/api.ts) — keep this in sync
// with CURRENCY_CODE in lib/currency.ts, which controls only display
// formatting, not what's sent to the backend/Stripe.
export const CHECKOUT_DEFAULTS = {
  flatShippingRate: 79, // ₹79 flat delivery fee — covers courier pickup/last-mile, not held as margin
  // Flip to `true` to make delivery free for everyone, no code needed.
  freeShipping: false,
  // Or leave freeShipping false and set a spend threshold instead —
  // orders at or above this subtotal ship free automatically. Set to
  // `null` to disable the threshold and always charge flatShippingRate
  // (unless freeShipping above is true, which wins regardless of spend).
  freeShippingThreshold: 999 as number | null,
  taxRate: 0.18, // GST
  currency: "INR",
};

// Shown in the checkout order summary as plain reassurance copy, not
// as actual line items — this store genuinely does not charge a
// platform fee or a packaging fee, unlike some marketplaces that tack
// these on right before payment. Keep these in sync with reality: if
// either fee is ever introduced for real, move it into a proper
// OrderSummary line item instead of leaving it here as a "we don't
// charge this" note.
export const FEE_NOTES = [
  { label: "Platform fee", note: "We are not those guys." },
  { label: "Packaging fee", note: "Seriously? Nope." },
];

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/afsanacollections",
  tiktok: "https://tiktok.com/@afsanacollections",
};