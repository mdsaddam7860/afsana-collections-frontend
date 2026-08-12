"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    // Always show the same success state, whether or not the email is
    // registered — matches the backend's deliberately generic response.
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg italic text-foreground">
          {BRAND.nameParts.first}{" "}
          <span className="text-accent">{BRAND.nameParts.second}</span>
        </Link>

        <h1 className="font-display text-fluid-h2 mt-8 italic text-foreground">
          Reset your password
        </h1>

        {sent ? (
          <p className="mt-4 text-sm text-muted">
            If an account exists for <span className="text-foreground">{email}</span>,
            we&apos;ve sent a link to reset your password. Check your inbox
            (and spam folder).
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
              <button
                type="submit"
                disabled={loading}
                className="btn-fill w-full rounded-sharp border border-accent py-4 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
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
