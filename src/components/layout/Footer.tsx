"use client";

import { useState } from "react";
import { BRAND, CATEGORIES, FOOTER_CONTENT } from "@/lib/constants";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-fluid-hero italic leading-none tracking-tight text-foreground">
            {FOOTER_CONTENT.newsletterHeadline.line1}
            <br />
            <span className="text-accent">{FOOTER_CONTENT.newsletterHeadline.line2}</span>
          </p>
          <p className="mt-6 max-w-xs text-sm text-muted">
            {FOOTER_CONTENT.newsletterBody}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mt-8 flex max-w-sm items-center border-b border-border pb-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 font-mono-price text-xs uppercase tracking-widest text-accent transition-opacity hover:opacity-70"
            >
              {submitted ? "Sent ✓" : "Join →"}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="font-mono-price text-xs uppercase tracking-widest text-muted">
              Shop
            </p>
            <ul className="mt-4 space-y-3 text-foreground/80">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug} className="transition-colors hover:text-accent">
                  {cat.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono-price text-xs uppercase tracking-widest text-muted">
              Support
            </p>
            <ul className="mt-4 space-y-3 text-foreground/80">
              {FOOTER_CONTENT.supportLinks.map((label) => (
                <li key={label} className="transition-colors hover:text-accent">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-border px-6 py-6 text-xs text-muted lg:px-8">
        <span>© {new Date().getFullYear()} {BRAND.name}</span>
        <span className="font-mono-price">{FOOTER_CONTENT.closingLine}</span>
      </div>
    </footer>
  );
}
