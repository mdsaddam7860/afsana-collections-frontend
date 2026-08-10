import Image from "next/image";
import Link from "next/link";
import { HERO_CONTENT } from "@/lib/constants";
import { cldUrl } from "@/lib/cloudinary";

export default function HeroSection() {
  return (
    <section className="relative mesh-atmosphere overflow-hidden pt-32">
      <div className="grain-overlay" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 md:grid-cols-[1.1fr_0.9fr] md:pb-32 lg:px-8">
        {/* Copy — offset, not centered */}
        <div className="relative z-10 md:col-start-1">
          <span className="font-mono-price text-xs uppercase tracking-[0.3em] text-accent">
            {HERO_CONTENT.eyebrow}
          </span>

          <h1 className="font-display text-fluid-hero mt-5 text-foreground">
            <span className="reveal-mask">
              <span className="reveal-line">{HERO_CONTENT.headlineLine1}</span>
            </span>
            <span className="reveal-mask">
              <span
                className="reveal-line italic text-accent"
                style={{ animationDelay: "0.12s" }}
              >
                {HERO_CONTENT.headlineLine2}
              </span>
            </span>
          </h1>

          <p
            className="stagger-in mt-7 max-w-md text-fluid-body text-muted"
            style={{ animationDelay: "0.5s" }}
          >
            {HERO_CONTENT.body}
          </p>

          <div
            className="stagger-in mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.65s" }}
          >
            <Link
              href={HERO_CONTENT.primaryCta.href}
              className="btn-fill rounded-pill border border-accent px-8 py-3.5 text-sm font-medium text-foreground transition-colors duration-300 hover:text-accent-foreground"
            >
              {HERO_CONTENT.primaryCta.label}
            </Link>
            <Link
              href={HERO_CONTENT.secondaryCta.href}
              className="group flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              {HERO_CONTENT.secondaryCta.label}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Product still life — asymmetric, offset from grid */}
        <div className="group relative aspect-[4/5] w-full translate-y-6 md:col-start-2 md:translate-y-0">
          <div className="relative h-full w-full overflow-hidden rounded-soft shadow-ambient [clip-path:inset(0_0_0_0)]">
            <Image
              src={cldUrl("hero-scrunchies.jpg")}
              alt="Model wearing an oversized silk scrunchie and acetate claw clip"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 90vw"
              className="img-zoom object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
          </div>
          <div
            aria-hidden
            className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full border border-accent/40"
          />
        </div>
      </div>
    </section>
  );
}
