"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_CONTENT, BRAND } from "@/lib/constants";
import { cldUrl } from "@/lib/cloudinary";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";

// useSearchParams() (used to read ?next=/checkout so we can send people
// back where they came from after signing in) requires a Suspense
// boundary around anything that calls it, or `next build` fails with
// "should be wrapped in a suspense boundary". The default export below
// is just that boundary; LoginForm has the real page content.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Couldn't sign you in — check your email and password.");
      return;
    }

    // Push whatever was in the guest (local) cart up to the backend and
    // let it reconcile with any cart already tied to this account, then
    // clear the local copy so it isn't double-added on next checkout —
    // the backend cart is now the source of truth for this session.
    try {
      await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });
      clearCart();
    } catch {
      // Non-fatal — login still succeeds even if the merge call fails.
    }

    setLoading(false);
    toast.success("Signed in.");

    // Admins land on the admin dashboard instead of the customer account
    // page, unless a specific ?next= destination was requested (e.g.
    // returning to /checkout) — that explicit intent wins either way.
    const explicitNext = searchParams.get("next");
    if (!explicitNext) {
      const session = await getSession();
      const role = (session?.user as { role?: string } | undefined)?.role;
      if (role === "admin") {
        router.push("/admin");
        return;
      }
    }
    router.push(next);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Brand imagery side */}
      <div className="mesh-atmosphere relative hidden overflow-hidden md:block">
        <div className="grain-overlay" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link
            href="/"
            className="font-display text-lg italic text-foreground"
          >
            {BRAND.nameParts.first}{" "}
            <span className="text-accent">{BRAND.nameParts.second}</span>
          </Link>
          <div>
            <p className="font-display text-fluid-h1 italic leading-none text-foreground">
              {AUTH_CONTENT.login.headline.line1}
              <br />
              {AUTH_CONTENT.login.headline.line2}
            </p>
            <p className="mt-4 max-w-xs text-sm text-muted">
              {AUTH_CONTENT.login.body}
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-soft shadow-ambient">
            <Image
              src={cldUrl("hero-scrunchies.jpg")}
              alt=""
              fill
              sizes="480px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="font-display text-lg italic text-foreground md:hidden"
          >
            {BRAND.nameParts.first}{" "}
            <span className="text-accent">{BRAND.nameParts.second}</span>
          </Link>

          <h1 className="font-display text-fluid-h2 mt-8 italic text-foreground md:mt-0">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted">
            New here?{" "}
            <Link
              href="/account/signup"
              className="text-accent hover:opacity-70"
            >
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="group relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full border-b border-border bg-transparent pb-2 pt-4 text-sm text-foreground placeholder-transparent transition-colors focus:border-accent focus:outline-none"
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-0 top-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
              >
                Email
              </label>
            </div>

            <div className="group relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full border-b border-border bg-transparent pb-2 pt-4 text-sm text-foreground placeholder-transparent transition-colors focus:border-accent focus:outline-none"
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-0 top-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
              >
                Password
              </label>
            </div>

            {error && (
              <p role="alert" className="font-mono-price text-xs text-accent">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-fill w-full rounded-sharp border border-accent py-4 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: next })}
            className="mt-6 w-full rounded-sharp border border-border py-3.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
