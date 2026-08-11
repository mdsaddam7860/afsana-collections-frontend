"use client";

import { useState } from "react";
import AddressFields, { EMPTY_ORDER_ADDRESS } from "./AddressFields";
import type { OrderAddress } from "@/types";

// ShippingAddress is just an alias for the backend's strict OrderAddress
// shape (fullName, phone, street, addressLine2, city, state, postalCode,
// country) — POST /orders 400s on extra or missing keys, so this
// component and AddressFields together are the single source of truth
// for exactly which fields exist.
export type ShippingAddress = OrderAddress;

export default function ShippingStep({
  value,
  onChange,
  billingSameAsShipping,
  onBillingSameAsShippingChange,
  billingValue,
  onBillingChange,
  onNext,
  onBack,
  loading = false,
}: {
  value: ShippingAddress;
  onChange: (v: ShippingAddress) => void;
  billingSameAsShipping: boolean;
  onBillingSameAsShippingChange: (v: boolean) => void;
  billingValue: OrderAddress;
  onBillingChange: (v: OrderAddress) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}) {
  const [billingTouched, setBillingTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onNext (handleShippingSubmit in the parent) isn't itself guarded
    // against re-entry — this is the only thing stopping a fast
    // double-click/Enter-repeat from firing two POST /checkout calls
    // and creating two orders + two payment intents for one submission.
    if (loading) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AddressFields idPrefix="shipping" value={value} onChange={onChange} />
      <p className="-mt-3 font-mono-price text-[11px] text-muted">
        For delivery updates and courier contact.
      </p>

      <label className="flex items-center gap-2 border-t border-border pt-6 text-sm text-muted">
        <input
          type="checkbox"
          checked={billingSameAsShipping}
          onChange={(e) => {
            onBillingSameAsShippingChange(e.target.checked);
            // First time someone unchecks this, seed the billing form
            // with the shipping address rather than starting blank —
            // most people's billing address IS their shipping address
            // with maybe one field different.
            if (!e.target.checked && !billingTouched) {
              onBillingChange(value);
              setBillingTouched(true);
            }
          }}
        />
        Billing address same as shipping
      </label>

      {!billingSameAsShipping && (
        <div className="space-y-6 rounded-soft border border-border p-5">
          <p className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
            Billing address
          </p>
          <AddressFields
            idPrefix="billing"
            value={billingValue ?? EMPTY_ORDER_ADDRESS}
            onChange={onBillingChange}
          />
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 rounded-sharp border border-border py-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-fill flex-[2] rounded-sharp border border-accent py-4 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Placing order…" : "Continue to payment"}
        </button>
      </div>
    </form>
  );
}
