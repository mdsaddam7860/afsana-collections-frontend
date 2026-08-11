import type { Metadata } from "next";

// Account/orders/addresses/wishlist and the login/signup pages nested
// under this segment are all private or auth-related — kept out of
// search results per the SEO requirement that /account should not be
// indexed. account/page.tsx is a Client Component ("use client"), which
// can't export `metadata` itself, so this layout (a Server Component)
// carries it instead.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
