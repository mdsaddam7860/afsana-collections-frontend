"use client";

import { useEffect, useState } from "react";
import type { Address } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/store/toast-store";

const EMPTY_FORM: Omit<Address, "id"> = {
  type: "SHIPPING",
  label: "",
  fullName: "",
  phone: "",
  street: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  isDefault: false,
};

export default function AddressBook() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<
    string | undefined
  >(undefined);
  const [form, setForm] = useState<Omit<Address, "id">>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    // Addresses saved before fullName/phone became required won't have
    // them — surface that as blank required fields the user must fill
    // in to re-save, rather than silently sending an incomplete PATCH
    // that the backend will now 400 on.
    setForm({ ...EMPTY_FORM, ...address });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const fullName = form.fullName.trim();
    const phone = form.phone.trim();

    if (!fullName) {
      setSaving(false);
      setError("Full name is required.");
      return;
    }
    // Backend validates phone as 7-15 digits, optionally +-prefixed,
    // and — unlike before — now requires it outright rather than
    // treating it as optional.
    if (!phone) {
      setSaving(false);
      setError("Phone number is required.");
      return;
    }
    if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      setSaving(false);
      setError("Phone must be 7-15 digits, optionally starting with +.");
      return;
    }

    const payload: Omit<Address, "id"> = { ...form, fullName, phone };

    try {
      const res = await fetch(
        editing
          ? `/api/account/addresses/${editing.id}`
          : "/api/account/addresses",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save address.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmingDeleteId) return;
    const res = await fetch(`/api/account/addresses/${confirmingDeleteId}`, {
      method: "DELETE",
    }).catch(() => null);
    setConfirmingDeleteId(undefined);
    if (!res?.ok) {
      toast.error("Couldn't delete this address.");
      return;
    }
    toast.success("Address deleted.");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-fluid-h2 italic text-foreground">
          Addresses
        </h2>
        <button
          onClick={openNew}
          className="btn-fill rounded-pill border border-accent px-5 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground"
        >
          + Add address
        </button>
      </div>

      {addresses === null ? (
        <p className="mt-6 font-mono-price text-xs uppercase tracking-widest text-muted">
          Loading…
        </p>
      ) : addresses.length === 0 ? (
        <p className="mt-6 font-mono-price text-xs uppercase tracking-widest text-muted">
          No saved addresses yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-soft border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-price text-[10px] uppercase tracking-widest text-accent">
                  {address.type}
                  {address.isDefault ? " · Default" : ""}
                </span>
              </div>
              {address.label && (
                <p className="mt-2 text-sm text-foreground">{address.label}</p>
              )}
              <p className="mt-1 text-sm text-foreground">
                {address.fullName || "—"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {address.street}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""},{" "}
                {address.city}, {address.state} {address.postalCode},{" "}
                {address.country}
              </p>
              {address.phone && (
                <p className="mt-1 text-xs text-muted">{address.phone}</p>
              )}
              {(!address.fullName || !address.phone) && (
                <p className="mt-2 font-mono-price text-[10px] uppercase tracking-widest text-accent">
                  Needs name &amp; phone — edit to update
                </p>
              )}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => openEdit(address)}
                  className="font-mono-price text-[11px] uppercase tracking-widest text-accent hover:opacity-70"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmingDeleteId(address.id)}
                  className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-soft border border-border bg-background p-6">
            <h3 className="font-display text-xl italic text-foreground">
              {editing ? "Edit address" : "New address"}
            </h3>

            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as Address["type"],
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                >
                  <option value="SHIPPING" className="bg-surface">
                    Shipping
                  </option>
                  <option value="BILLING" className="bg-surface">
                    Billing
                  </option>
                </select>
                <input
                  placeholder="Label (e.g. Home)"
                  value={form.label ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, label: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <input
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <input
                placeholder="Street"
                value={form.street}
                onChange={(e) =>
                  setForm((f) => ({ ...f, street: e.target.value }))
                }
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <input
                placeholder="Apartment, suite, etc. (optional)"
                value={form.addressLine2 ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, addressLine2: e.target.value }))
                }
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Postal code"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, postalCode: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <input
                  placeholder="Country (ISO-2, e.g. IN)"
                  value={form.country}
                  maxLength={2}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      country: e.target.value.toUpperCase(),
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <input
                placeholder="Phone (required)"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isDefault: e.target.checked }))
                  }
                />
                Set as default
              </label>
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
                disabled={saving}
                className="btn-fill rounded-pill border border-accent px-6 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save address"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmingDeleteId}
        title="Delete this address?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDeleteId(undefined)}
      />
    </div>
  );
}
