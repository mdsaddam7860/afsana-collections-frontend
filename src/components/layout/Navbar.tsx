"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCartStore, selectItemCount } from "@/store/cart-store";
import { BRAND, CATEGORIES } from "@/lib/constants";
import { useDialogA11y } from "@/hooks/useDialogA11y";

const NAV_LINKS = CATEGORIES.map((c) => ({
  href: `/shop/${c.slug}`,
  label: c.label,
}));

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const itemCount = useCartStore(selectItemCount);
  const openCart = useCartStore((s) => s.openCart);
  const [pulse, setPulse] = useState(false);
  const mobileMenuRef = useDialogA11y(mobileMenuOpen, () =>
    setMobileMenuOpen(false)
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (itemCount === 0) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 450);
    return () => clearTimeout(t);
  }, [itemCount]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-5xl items-center justify-between transition-all duration-500 ease-out ${
          scrolled
            ? "glass-panel rounded-pill px-6 py-2.5 shadow-lift"
            : "rounded-pill px-6 py-3"
        }`}
      >
        {/* Mobile menu toggle — the category links below are hidden below
            md, so this is the only way to reach /shop/* on a phone. */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`block h-px w-5 bg-foreground transition-transform duration-300 ${
              mobileMenuOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-foreground transition-transform duration-300 ${
              mobileMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>

        <Link href="/" className="font-display text-lg italic tracking-tight">
          {BRAND.nameParts.first}{" "}
          <span className="text-accent">{BRAND.nameParts.second}</span>
        </Link>

        <div className="hidden gap-7 text-sm text-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm sm:gap-5">
          <Link
            href={session ? "/account" : "/account/login"}
            className="flex items-center gap-1.5 text-muted transition-colors hover:text-foreground"
            aria-label={session ? "Your account" : "Sign in"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="hidden font-mono-price text-xs uppercase tracking-widest sm:inline">
              {session
                ? session.user?.name?.split(" ")[0] || "Account"
                : "Sign In"}
            </span>
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative font-mono-price text-xs uppercase tracking-widest text-foreground"
          >
            Bag
            {itemCount > 0 && (
              <span
                className={`absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground ${
                  pulse ? "badge-pulse" : ""
                }`}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
          />
          <div
            ref={mobileMenuRef as React.RefObject<HTMLDivElement>}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="glass-panel fixed inset-x-4 top-20 z-40 rounded-soft p-2 shadow-lift md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-sharp px-4 py-3 text-sm text-foreground transition-colors hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
