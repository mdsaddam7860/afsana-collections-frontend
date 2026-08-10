import type { Metadata } from "next";
import { Fraunces, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/layout/AuthProvider";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { SEO } from "@/lib/constants";

// Root layout only sets up fonts, the atmosphere, and the session
// provider (needed everywhere useSession() is called, including admin).
// It does NOT render Navbar/Footer/CartDrawer — those are storefront
// chrome and live in app/(storefront)/layout.tsx, so the admin route
// group never ships storefront components in its bundle, and vice versa.

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: SEO.title,
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
};

export const viewport = {
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
      </body>
    </html>
  );
}
