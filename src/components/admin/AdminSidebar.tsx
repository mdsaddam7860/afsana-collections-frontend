"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Inventory" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/discounts", label: "Discounts" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-b border-border bg-surface px-6 py-6 md:h-screen md:w-60 md:border-b-0 md:border-r md:py-8">
      <div className="flex items-center justify-between md:block">
        <div>
          <Link
            href="/admin"
            className="font-display text-lg italic text-foreground"
          >
            Afsana <span className="text-accent">Collections</span>
          </Link>
          <p className="mt-1 font-mono-price text-[10px] uppercase tracking-widest text-muted">
            Admin
          </p>
        </div>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto md:mt-10 md:flex-col md:overflow-visible">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-sharp border-l-2 px-3 py-2.5 font-mono-price text-xs uppercase tracking-widest transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-row gap-4 md:mt-auto md:flex-col md:gap-3">
        <Link
          href="/"
          className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-foreground"
        >
          ← Back to store
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/account/login" })}
          className="text-left font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
