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
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
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
  themeColor: "#211820",
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
