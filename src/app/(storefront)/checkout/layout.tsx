import type { Metadata } from "next";

// checkout/page.tsx is a Client Component, so the noindex directive
// lives here instead (Server Component layout wrapping it).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
