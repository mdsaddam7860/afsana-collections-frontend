"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types";

export default function ProfilePanel() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data: User) => {
        setUser(data);
        setName(data.name ?? "");
        setEmail(data.email ?? "");
      })
      .catch(() => null);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    // PATCH /users/me now accepts "name" (optional on the backend, but
    // we send it whenever it has a value so people can actually rename
    // their account).
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() || undefined, email }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Couldn't save your changes.");
      return;
    }
    const updated = await res.json();
    setUser(updated);
    setSaved(true);
  };

  return (
    <div>
      <h2 className="font-display text-fluid-h2 italic text-foreground">
        Your info
      </h2>

      {user === null ? (
        <p className="mt-6 font-mono-price text-xs uppercase tracking-widest text-muted">
          Loading…
        </p>
      ) : (
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
          </div>
          <div>
            <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
              Account type
            </label>
            <p className="mt-1 text-sm capitalize text-foreground">{user.role}</p>
          </div>
          <div>
            <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
              Account ID
            </label>
            <p className="mt-1 font-mono-price text-xs text-muted">{user.id}</p>
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
      )}
    </div>
  );
}
