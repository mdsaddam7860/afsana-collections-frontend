/**
 * Every image in the app is referenced by NAME ONLY (e.g.
 * "product-scrunchie-1.jpg") — never a full URL. cldUrl() combines that
 * name with NEXT_PUBLIC_CLOUDINARY_BASE_URL to build the actual src.
 *
 * This means:
 *  - Swapping Cloudinary accounts/folders later = change one env var,
 *    not every component.
 *  - Product data (mock or from the backend) only ever needs to carry
 *    a filename, not a Cloudinary URL — keeps the backend decoupled
 *    from which CDN you use.
 *
 * NEXT_PUBLIC_CLOUDINARY_BASE_URL should be your Cloudinary delivery
 * base up to (and including) the version/transformation segment, e.g.:
 *   https://res.cloudinary.com/<cloud_name>/image/upload/f_auto,q_auto
 * cldUrl("product-scrunchie-1.jpg") then resolves to:
 *   https://res.cloudinary.com/<cloud_name>/image/upload/f_auto,q_auto/product-scrunchie-1.jpg
 */

const CLOUDINARY_BASE_URL =
  process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL ?? "";

// Falls back to this whenever there's no image to show at all — e.g. a
// product created via the admin upload flow before any photo exists in
// its `images` array (see NewProductForm.tsx: images: [] on create,
// since the backend has no endpoint to set `images` after creation —
// uploaded photos land in the separate Media table instead, which the
// storefront's grid/list views don't read from).
const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export function cldUrl(name?: string | null): string {
  if (!name) {
    return PLACEHOLDER_IMAGE;
  }
  // This backend's `images` field already stores full, absolute URLs in
  // some cases (see prisma/seed.ts and any product created directly via
  // POST /admin/products with real image URLs) — pass those through
  // unchanged rather than mangling them into `${BASE}/https://...`.
  if (/^https?:\/\//i.test(name)) {
    return name;
  }
  if (!CLOUDINARY_BASE_URL) {
    // Fail loud in dev rather than silently rendering a broken <img> —
    // easy to miss otherwise since Next won't error on a bad src string.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `cldUrl("${name}") called with no NEXT_PUBLIC_CLOUDINARY_BASE_URL set — check .env.local`
      );
    }
    return `/${name}`;
  }
  return `${CLOUDINARY_BASE_URL.replace(/\/$/, "")}/${name.replace(/^\//, "")}`;
}