const withPWA = require("next-pwa")({
  dest: "public",
  // Service worker only makes sense in production — in dev it would
  // aggressively cache hot-reloaded assets and mask real changes.
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Widened from a Cloudinary-only allowlist so test/demo image URLs
    // (e.g. hand-typed product image links from arbitrary sites) also
    // render during development. This is more permissive than
    // production typically wants — next/image's remotePatterns exists
    // specifically to prevent optimizing/proxying arbitrary external
    // images. Before shipping, consider narrowing this back down to
    // just the real image hosts you actually use (Cloudinary, plus
    // any others you intentionally allow).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = withPWA(nextConfig);
