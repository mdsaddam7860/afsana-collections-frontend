"use client";

import { useState } from "react";
import { toast } from "@/store/toast-store";

// Mirrors PATCH /admin/orders/:id/status — only accepts these three;
// cancel/return go through their own dedicated endpoints (see
// OrderRow.tsx's return approve/reject buttons on the list page).
const STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderStatusControl({
  orderId,
  status: initialStatus,
  paymentMethod,
}: {
  orderId: string;
  status: string;
  paymentMethod?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: string) => {
    const prev = status;
    // COD's DELIVERED transition also stamps paidAt server-side — this
    // is the one status change on this screen where clicking through
    // means two things happen at once (marking shipped/delivered AND
    // confirming the driver actually collected cash), so it gets an
    // extra confirm step instead of firing immediately like the others.
    if (next === "DELIVERED" && paymentMethod === "COD") {
      const confirmed = window.confirm(
        "Mark this order DELIVERED and confirm the cash was collected from the customer?"
      );
      if (!confirmed) return;
    }
    setStatus(next);
    setSaving(true);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: next }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      setStatus(prev);
      const body = await res?.json().catch(() => ({}));
      toast.error(body?.error || "Couldn't update status.");
      return;
    }
    toast.success(
      next === "DELIVERED" && paymentMethod === "COD"
        ? "Delivered — cash collection confirmed."
        : `Marked as ${next.toLowerCase()}.`
    );
  };

  return (
    <select
      value={STATUSES.includes(status) ? status : ""}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className="rounded-sharp border border-border bg-transparent px-4 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground disabled:opacity-40"
    >
      {!STATUSES.includes(status) && (
        <option value="" disabled className="bg-surface">
          {status}
        </option>
      )}
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-surface">
          {s === "DELIVERED" && paymentMethod === "COD"
            ? "DELIVERED (cash collected)"
            : s}
        </option>
      ))}
    </select>
  );
}
