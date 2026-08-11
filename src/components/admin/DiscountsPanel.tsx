"use client";

import { useState } from "react";
import type { Discount } from "@/types";

const EMPTY_FORM = {
  code: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
  value: 10,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  usageLimitGlobal: 100,
  usageLimitPerUser: 1,
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10),
  isActive: true,
};

export default function DiscountsPanel({
  initialDiscounts,
}: {
  initialDiscounts: Discount[];
}) {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const res = await fetch("/api/admin/discounts");
    if (res.ok) setDiscounts(await res.json());
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (d: Discount) => {
    setEditing(d);
    setForm({
      code: d.code,
      type: d.type,
      value: d.value,
      minOrderAmount: d.minOrderAmount ?? 0,
      maxDiscountAmount: d.maxDiscountAmount ?? 0,
      usageLimitGlobal: d.usageLimitGlobal ?? 0,
      usageLimitPerUser: d.usageLimitPerUser ?? 0,
      validFrom: d.validFrom.slice(0, 10),
      validUntil: d.validUntil.slice(0, 10),
      isActive: d.isActive,
    });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    // minOrderAmount is nonnegative().optional() on the backend, so 0 is
    // valid and fine to send as-is. maxDiscountAmount, usageLimitGlobal,
    // and usageLimitPerUser are all positive().optional() — 0 is NOT a
    // valid value for them, so a 0/empty entry must be omitted from the
    // payload entirely rather than sent as 0, or the backend 400s.
    const payload: Record<string, unknown> = {
      code: form.code,
      type: form.type,
      value: form.value,
      minOrderAmount: form.minOrderAmount,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
      isActive: form.isActive,
    };
    if (form.maxDiscountAmount > 0)
      payload.maxDiscountAmount = form.maxDiscountAmount;
    if (form.usageLimitGlobal > 0)
      payload.usageLimitGlobal = form.usageLimitGlobal;
    if (form.usageLimitPerUser > 0)
      payload.usageLimitPerUser = form.usageLimitPerUser;

    try {
      const res = await fetch(
        editing ? `/api/admin/discounts/${editing.id}` : "/api/admin/discounts",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save discount.");
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save discount.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this discount code?")) return;
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    reload();
  };

  return (
    <div>
      <button
        onClick={openNew}
        className="btn-fill rounded-pill border border-accent px-6 py-2.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground"
      >
        + New discount
      </button>

      <div className="mt-6 overflow-x-auto rounded-soft border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface font-mono-price text-[10px] uppercase tracking-widest text-muted">
              <th className="px-5 py-3 font-normal">Code</th>
              <th className="px-5 py-3 font-normal">Type</th>
              <th className="px-5 py-3 font-normal">Value</th>
              <th className="px-5 py-3 font-normal">Valid until</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-mono-price text-foreground">
                  {d.code}
                </td>
                <td className="px-5 py-3 text-muted">{d.type}</td>
                <td className="px-5 py-3 text-muted">
                  {d.type === "PERCENTAGE" ? `${d.value}%` : d.value}
                </td>
                <td className="px-5 py-3 text-muted">
                  {new Date(d.validUntil).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-pill border px-3 py-1 font-mono-price text-[10px] uppercase tracking-widest ${
                      d.isActive
                        ? "border-accent/50 text-accent"
                        : "border-border text-muted"
                    }`}
                  >
                    {d.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-4">
                    <button
                      onClick={() => openEdit(d)}
                      className="font-mono-price text-[11px] uppercase tracking-widest text-accent hover:opacity-70"
                    >
                      Edit
                    </button>
                    {d.isActive && (
                      <button
                        onClick={() => handleDeactivate(d.id)}
                        className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {discounts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-6 text-center text-sm text-muted"
                >
                  No discount codes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-soft border border-border bg-background p-6">
            <h3 className="font-display text-xl italic text-foreground">
              {editing ? "Edit discount" : "New discount"}
            </h3>

            <div className="mt-5 space-y-3">
              <input
                placeholder="Code (e.g. WELCOME10)"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                disabled={!!editing}
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted disabled:opacity-50"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT",
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                >
                  <option value="PERCENTAGE" className="bg-surface">
                    Percentage
                  </option>
                  <option value="FIXED_AMOUNT" className="bg-surface">
                    Fixed amount
                  </option>
                </select>
                <input
                  type="number"
                  placeholder="Value"
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: Number(e.target.value) }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                    Valid from
                  </label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validFrom: e.target.value }))
                    }
                    className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                    Valid until
                  </label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validUntil: e.target.value }))
                    }
                    className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                    Min order amount (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        minOrderAmount: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                    Max discount amount (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="No cap"
                    value={form.maxDiscountAmount || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxDiscountAmount: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                  />
                  <p className="mt-1 font-mono-price text-[10px] text-muted">
                    Leave blank/0 for no cap — the backend rejects 0 as an
                    explicit value, so it's omitted from the request instead.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Usage limit (global)"
                  value={form.usageLimitGlobal}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      usageLimitGlobal: Number(e.target.value),
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                />
                <input
                  type="number"
                  placeholder="Usage limit (per user)"
                  value={form.usageLimitPerUser}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      usageLimitPerUser: Number(e.target.value),
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 font-mono-price text-xs text-accent"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="font-mono-price text-xs uppercase tracking-widest text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.code}
                className="btn-fill rounded-pill border border-accent px-6 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save discount"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
