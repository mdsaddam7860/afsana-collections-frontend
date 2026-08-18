"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { toast } from "@/store/toast-store";

const RESEND_COOLDOWN_SECONDS = 60;

// The destination for the OTP a new signup receives by email — this
// page didn't exist before, so there was nowhere to actually enter
// that code. See signup/page.tsx, which now redirects here right
// after registration instead of trying (and failing) to sign in
// immediately on an unverified account.
export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("No email to verify — start over from the signup page.");
      return;
    }
    if (otp.trim().length === 0) {
      setError("Enter the code from your email.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otp.trim() }),
    }).catch(() => null);
    setLoading(false);

    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}));
      setError(body?.error || "That code didn't work — check it and try again.");
      return;
    }

    toast.success("Email verified — sign in to continue.");
    router.push("/account/login");
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setResending(false);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success("Code sent — check your inbox.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg italic text-foreground">
          {BRAND.nameParts.first}{" "}
          <span className="text-accent">{BRAND.nameParts.second}</span>
        </Link>

        <h1 className="font-display text-fluid-h2 mt-8 italic text-foreground">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted">
          {email ? (
            <>
              We sent a code to <span className="text-foreground">{email}</span>.
              Enter it below to activate your account.
            </>
          ) : (
            "We sent you a code by email. Enter it below to activate your account."
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="group relative">
            <input
              ref={inputRef}
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-border bg-transparent pb-2 pt-4 text-center font-mono-price text-lg tracking-[0.3em] text-foreground placeholder-transparent transition-colors focus:border-accent focus:outline-none"
            />
            <label
              htmlFor="otp"
              className="pointer-events-none absolute left-0 top-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
            >
              Verification code
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
            {loading ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-accent hover:opacity-70 disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            {resending
              ? "Sending…"
              : cooldown > 0
              ? `Resend code (${cooldown}s)`
              : "Resend code"}
          </button>
        </p>

        <p className="mt-8 text-sm text-muted">
          <Link href="/account/login" className="text-accent hover:opacity-70">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
