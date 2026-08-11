import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/layout/AuthProvider";
import ThemeProvider from "@/components/layout/ThemeProvider";
import ToastContainer from "@/components/ui/ToastContainer";
import { BRAND, SEO, SITE_URL } from "@/lib/constants";

// Root layout only sets up fonts, the atmosphere, and the session
// provider (needed everywhere useSession() is called, including admin).
// It does NOT render Navbar/Footer/CartDrawer — those are storefront
// chrome and live in app/(storefront)/layout.tsx, so the admin route
// group never ships storefront components in its bundle, and vice versa.

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  // Explicit even though "swap" is next/font's default — text renders
  // with a fallback font immediately rather than staying invisible
  // until Fraunces loads (avoids an FOIT-driven LCP/CLS hit).
  display: "swap",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO.title,
    // Every page below sets its own title via generateMetadata/metadata
    // exports; this template only applies when a page provides a short
    // title without repeating the brand name.
    template: `%s — ${BRAND.name}`,
  },
  description: SEO.description,
  manifest: "/manifest.json",
  icons: {
    // Next.js emits these as <link rel="..."> tags in <head>. favicon.ico
    // is the classic browser-tab/bookmark fallback every browser still
    // checks for by convention; icon.svg is preferred by browsers that
    // support it (crisp at any size, follows the same "AC" monogram);
    // apple-touch-icon is what iOS uses for home-screen/bookmark icons.
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SEO.title,
  },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: SEO.title,
    description: SEO.description,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#F8F3EC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
