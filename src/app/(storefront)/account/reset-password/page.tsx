"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND } from "@/lib/constants";

// This is the page the link in the "reset your password" email must
// point to. It was 404ing before because nothing existed at this
// route at all — /account/forgot-password only sent the email, it
// never had a matching /account/reset-password?token=... destination
// for the link inside that email to land on.
//
// ASSUMPTION: reads the token from a `?token=` query param, matching
// the most common convention. If the actual email links to a
// different param name (e.g. `?code=` or a path segment), swap the
// `searchParams.get("token")` line below.
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setLoading(false);

    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}));
      setError(
        body?.error ||
          "Couldn't reset your password — this link may have expired. Request a new one."
      );
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/account/login"), 2500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg italic text-foreground">
          {BRAND.nameParts.first}{" "}
          <span className="text-accent">{BRAND.nameParts.second}</span>
        </Link>

        <h1 className="font-display text-fluid-h2 mt-8 italic text-foreground">
          Set a new password
        </h1>

        {!token ? (
          <p className="mt-4 text-sm text-muted">
            This link is missing its reset token — it may have been copied
            incorrectly. Request a new reset link from{" "}
            <Link href="/account/forgot-password" className="text-accent hover:opacity-70">
              here
            </Link>
            .
          </p>
        ) : done ? (
          <p className="mt-4 text-sm text-muted">
            Your password has been reset. Taking you to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="group relative">
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full border-b border-border bg-transparent pb-2 pt-4 text-sm text-foreground placeholder-transparent transition-colors focus:border-accent focus:outline-none"
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-0 top-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
              >
                New password
              </label>
            </div>

            <div className="group relative">
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                className="peer w-full border-b border-border bg-transparent pb-2 pt-4 text-sm text-foreground placeholder-transparent transition-colors focus:border-accent focus:outline-none"
              />
              <label
                htmlFor="confirmPassword"
                className="pointer-events-none absolute left-0 top-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
              >
                Confirm password
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
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        <p className="mt-8 text-sm text-muted">
          <Link href="/account/login" className="text-accent hover:opacity-70">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
