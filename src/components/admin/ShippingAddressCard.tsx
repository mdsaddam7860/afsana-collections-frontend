"use client";

import { useState } from "react";
import type { OrderShippingAddress } from "@/types";
import { toast } from "@/store/toast-store";

export default function ShippingAddressCard({
  address,
  orderId,
}: {
  address: OrderShippingAddress;
  orderId: string;
}) {
  const [copied, setCopied] = useState(false);

  const asText = [
    address.fullName,
    address.phone,
    address.street,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(asText);
      setCopied(true);
      toast.success("Address copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  };

  return (
    <div className="rounded-soft border border-accent/40 bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
          Ship to
        </p>
        <button
          onClick={handleCopy}
          className="font-mono-price text-[11px] uppercase tracking-widest text-accent hover:opacity-70"
        >
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {address.fullName}
        <br />
        {address.street}
        {address.addressLine2 && (
          <>
            <br />
            {address.addressLine2}
          </>
        )}
        <br />
        {address.city}, {address.state} {address.postalCode}
        <br />
        {address.country}
      </p>

      <p className="mt-3 font-mono-price text-xs text-muted">{address.phone}</p>

      <p className="mt-4 border-t border-border pt-3 font-mono-price text-[10px] text-muted">
        Reference order #{orderId} on the shipping label.
      </p>
    </div>
  );
}
