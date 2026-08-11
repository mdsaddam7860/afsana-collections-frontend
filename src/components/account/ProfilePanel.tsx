"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "@/store/toast-store";
import ErrorState from "@/components/ui/ErrorState";
import type { User } from "@/types";

export default function ProfilePanel() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneVerifyError, setPhoneVerifyError] = useState<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadUser = () => {
    setLoadError(null);
    fetch("/api/account/profile")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(data.error || "Couldn't load your profile.");
        }
        return data as User;
      })
      .then((data) => {
        setUser(data);
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Couldn't load your profile."
        );
      });
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || undefined,
        email,
        phone: phone.trim() || undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body.error || "Couldn't save your changes.";
      setError(message);
      toast.error(message);
      return;
    }
    const updated = await res.json();
    setUser(updated);
    setSaved(true);
    toast.success("Profile updated.");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    const res = await fetch("/api/account/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    setVerifying(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setVerifyError(body.error || "Invalid or expired code.");
      return;
    }
    setOtp("");
    toast.success("Email verified.");
    loadUser();
  };

  const handleResend = async () => {
    setResending(true);
    setVerifyError(null);
    const res = await fetch("/api/account/resend-verification", {
      method: "POST",
    });
    setResending(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body.error || "Couldn't resend the code.";
      setVerifyError(message);
      toast.error(message);
      return;
    }
    toast.success("A new code has been sent.");
  };

  const handleSendPhoneOtp = async () => {
    setSendingPhoneOtp(true);
    setPhoneVerifyError(null);
    const res = await fetch("/api/account/phone/send-otp", { method: "POST" });
    setSendingPhoneOtp(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body.error || "Couldn't send a code.";
      setPhoneVerifyError(message);
      toast.error(message);
      return;
    }
    setPhoneOtpSent(true);
    toast.success("Code sent to your phone.");
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingPhone(true);
    setPhoneVerifyError(null);
    const res = await fetch("/api/account/phone/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: phoneOtp }),
    });
    setVerifyingPhone(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPhoneVerifyError(body.error || "Invalid or expired code.");
      return;
    }
    setPhoneOtp("");
    setPhoneOtpSent(false);
    toast.success("Phone verified.");
    loadUser();
  };

  return (
    <div>
      <h2 className="font-display text-fluid-h2 italic text-foreground">
        Your info
      </h2>

      {loadError ? (
        <ErrorState
          title="Couldn't load your profile"
          description={loadError}
          onRetry={loadUser}
        />
      ) : user === null ? (
        <p className="mt-6 font-mono-price text-xs uppercase tracking-widest text-muted">
          Loading…
        </p>
      ) : (
        <>
          <form onSubmit={handleSave} className="mt-6 max-w-sm space-y-4">
            <div>
              <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>
            <div>
              <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
              <p className="mt-1 font-mono-price text-[10px] uppercase tracking-widest text-muted">
                {user.emailVerified ? (
                  <span className="text-accent">Verified</span>
                ) : (
                  <span>Not verified</span>
                )}
              </p>
            </div>
            <div>
              <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 555 0100"
                className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              {user.phone && (
                <p className="mt-1 font-mono-price text-[10px] uppercase tracking-widest text-muted">
                  {user.phoneVerified ? (
                    <span className="text-accent">Verified</span>
                  ) : (
                    <span>Not verified</span>
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                Account type
              </label>
              <p className="mt-1 text-sm capitalize text-foreground">
                {user.role?.toLowerCase() ?? "—"}
              </p>
            </div>
            <div>
              <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                Account ID
              </label>
              <p className="mt-1 font-mono-price text-xs text-muted">
                {user.id}
              </p>
            </div>

            {error && (
              <p role="alert" className="font-mono-price text-xs text-accent">
                {error}
              </p>
            )}
            {saved && !error && (
              <p className="font-mono-price text-xs text-accent">Saved.</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-fill rounded-pill border border-accent px-6 py-2.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>

          {!user.emailVerified && (
            <div className="mt-8 max-w-sm rounded-soft border border-accent/40 bg-surface p-5">
              <p className="font-mono-price text-[11px] uppercase tracking-widest text-accent">
                Verify your email
              </p>
              <p className="mt-2 text-sm text-muted">
                Enter the 6-digit code sent to {user.email} when you signed up.
                Orders can&apos;t be placed until this is confirmed.
              </p>
              <form onSubmit={handleVerify} className="mt-4 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-32 rounded-sharp border border-border bg-transparent px-3 py-2 text-center font-mono-price text-sm tracking-[0.3em] text-foreground placeholder:tracking-normal placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={verifying || otp.length !== 6}
                  className="rounded-sharp border border-accent px-4 py-2 font-mono-price text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
                >
                  {verifying ? "Checking…" : "Verify"}
                </button>
              </form>
              {verifyError && (
                <p
                  role="alert"
                  className="mt-2 font-mono-price text-xs text-accent"
                >
                  {verifyError}
                </p>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="mt-3 font-mono-price text-[10px] uppercase tracking-widest text-muted underline underline-offset-2 hover:text-foreground disabled:opacity-40"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            </div>
          )}

          {user.emailVerified && !user.phoneVerified && user.phone && (
            <div className="mt-8 max-w-sm rounded-soft border border-border bg-surface p-5">
              <p className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
                Verify your phone
              </p>
              {!phoneOtpSent ? (
                <>
                  <p className="mt-2 text-sm text-muted">
                    Confirm {user.phone} by text — we&apos;ll send a 6-digit
                    code.
                  </p>
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={sendingPhoneOtp}
                    className="mt-4 rounded-sharp border border-accent px-4 py-2 font-mono-price text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
                  >
                    {sendingPhoneOtp ? "Sending…" : "Send code"}
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-muted">
                    Enter the 6-digit code sent to {user.phone}.
                  </p>
                  <form
                    onSubmit={handleVerifyPhone}
                    className="mt-4 flex gap-2"
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={phoneOtp}
                      onChange={(e) =>
                        setPhoneOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="123456"
                      className="w-32 rounded-sharp border border-border bg-transparent px-3 py-2 text-center font-mono-price text-sm tracking-[0.3em] text-foreground placeholder:tracking-normal placeholder:text-muted"
                    />
                    <button
                      type="submit"
                      disabled={verifyingPhone || phoneOtp.length !== 6}
                      className="rounded-sharp border border-accent px-4 py-2 font-mono-price text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
                    >
                      {verifyingPhone ? "Checking…" : "Verify"}
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={sendingPhoneOtp}
                    className="mt-3 font-mono-price text-[10px] uppercase tracking-widest text-muted underline underline-offset-2 hover:text-foreground disabled:opacity-40"
                  >
                    {sendingPhoneOtp ? "Sending…" : "Resend code"}
                  </button>
                </>
              )}
              {phoneVerifyError && (
                <p
                  role="alert"
                  className="mt-2 font-mono-price text-xs text-accent"
                >
                  {phoneVerifyError}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/account/login" })}
            className="mt-8 font-mono-price text-xs uppercase tracking-widest text-muted hover:text-accent"
          >
            Log out
          </button>
        </>
      )}
    </div>
  );
}
