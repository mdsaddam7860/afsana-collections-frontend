"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AUTH_CONTENT, BRAND } from "@/lib/constants";
import { cldUrl } from "@/lib/cloudinary";
import { toast } from "@/store/toast-store";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone: phone || undefined, password }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setLoading(false);
      const body = await res?.json().catch(() => ({}));
      setError(body?.error || "Something went wrong creating your account.");
      return;
    }

    setLoading(false);

    // The account isn't verified yet — signing in immediately here
    // would just fail (and previously did, silently bouncing to the
    // login page with no way to actually enter the OTP anywhere, since
    // that page never existed). Send them to verify first instead.
    toast.success("Account created — check your email for a verification code.");
    router.push(`/account/verify-otp?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
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
              {AUTH_CONTENT.signup.headline.line1}
              <br />
              {AUTH_CONTENT.signup.headline.line2}
            </p>
            <p className="mt-4 max-w-xs text-sm text-muted">
              {AUTH_CONTENT.signup.body}
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
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Already have one?{" "}
            <Link
              href="/account/login"
              className="text-accent hover:opacity-70"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <FloatingField
              id="name"
              label="Name"
              type="text"
              value={name}
              onChange={setName}
            />
            <FloatingField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
            />
            <FloatingField
              id="phone"
              label="Phone (optional)"
              type="tel"
              value={phone}
              onChange={setPhone}
              required={false}
            />
            <FloatingField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />

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
              {loading ? "Creating account…" : "Create account"}
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
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="mt-6 w-full rounded-sharp border border-border py-3.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingField({
  id,
  label,
  type,
  value,
  onChange,
  required = true,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="group relative">
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full border-b border-border bg-transparent pb-2 pt-4 text-sm text-foreground placeholder-transparent transition-colors focus:border-accent focus:outline-none"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
      >
        {label}
      </label>
    </div>
  );
}
