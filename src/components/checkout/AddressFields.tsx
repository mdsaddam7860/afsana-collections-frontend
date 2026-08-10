"use client";

import FloatingField from "./FloatingField";
import type { OrderAddress } from "@/types";

// country is fixed to "IN" rather than a form field — this storefront
// only ships within India (see CHECKOUT_DEFAULTS.currency = "INR");
// add a country selector here first if that changes.
export default function AddressFields({
  value,
  onChange,
  idPrefix,
}: {
  value: OrderAddress;
  onChange: (v: OrderAddress) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-6">
      <FloatingField
        id={`${idPrefix}-fullName`}
        label="Full name"
        autoComplete="name"
        value={value.fullName}
        onChange={(v) => onChange({ ...value, fullName: v })}
      />
      <FloatingField
        id={`${idPrefix}-street`}
        label="Street address"
        autoComplete="street-address"
        value={value.street}
        onChange={(v) => onChange({ ...value, street: v })}
      />
      <FloatingField
        id={`${idPrefix}-addressLine2`}
        label="Apartment, suite, etc. (optional)"
        autoComplete="address-line2"
        value={value.addressLine2}
        onChange={(v) => onChange({ ...value, addressLine2: v })}
      />
      <FloatingField
        id={`${idPrefix}-city`}
        label="City"
        autoComplete="address-level2"
        value={value.city}
        onChange={(v) => onChange({ ...value, city: v })}
      />
      <div className="grid grid-cols-2 gap-5">
        <FloatingField
          id={`${idPrefix}-state`}
          label="State"
          autoComplete="address-level1"
          value={value.state}
          onChange={(v) => onChange({ ...value, state: v })}
        />
        <FloatingField
          id={`${idPrefix}-postalCode`}
          label="PIN code"
          autoComplete="postal-code"
          value={value.postalCode}
          onChange={(v) => onChange({ ...value, postalCode: v })}
        />
      </div>
      <FloatingField
        id={`${idPrefix}-phone`}
        label="Phone number"
        type="tel"
        autoComplete="tel"
        value={value.phone}
        onChange={(v) => onChange({ ...value, phone: v })}
      />
    </div>
  );
}

export const EMPTY_ORDER_ADDRESS: OrderAddress = {
  fullName: "",
  phone: "",
  street: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
};
