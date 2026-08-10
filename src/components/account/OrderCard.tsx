"use client";

import { useState } from "react";
import Image from "next/image";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/currency";
import { cldUrl } from "@/lib/cloudinary";

// Status labels — backend uses uppercase values (see OrderStatus in
// src/types/index.ts): PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED.
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const RETURN_LABEL: Record<string, string> = {
  REQUESTED: "Requested — awaiting review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Conservative guess at which statuses still allow cancelling/returning —
// confirm against your backend's actual rules; it will reject the call
// server-side either way if a status is ineligible.
const CANCELLABLE = ["PENDING", "PROCESSING"];
const RETURNABLE = ["DELIVERED", "SHIPPED"];

export default function OrderCard({
  order,
  onChange,
}: {
  order: Order;
  onChange?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const status = order.status.toUpperCase();

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setBusy(true);
    setActionError(null);
    const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setActionError(body.error || "Couldn't cancel this order.");
      return;
    }
    onChange?.();
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) return;
    setBusy(true);
    setActionError(null);
    const res = await fetch(`/api/orders/${order.id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: returnReason }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setActionError(body.error || "Couldn't start a return.");
      return;
    }
    setShowReturnForm(false);
    setReturnReason("");
    onChange?.();
  };

  return (
    <div className="stagger-in rounded-soft border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="font-mono-price text-xs text-foreground">#{order.id}</p>
          <p className="mt-1 text-xs text-muted">
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`rounded-pill border px-3 py-1 font-mono-price text-[10px] uppercase tracking-widest ${
            status === "DELIVERED"
              ? "border-accent/50 text-accent"
              : "border-border text-muted"
          }`}
        >
          {STATUS_LABEL[status] ?? order.status}
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {order.lines.map((line) => (
          <li key={line.variantId} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-soft bg-surface-raised">
              <Image src={cldUrl(line.image)} alt={line.name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-1 items-baseline justify-between text-sm">
              <span className="text-foreground">
                {line.name} <span className="text-muted">× {line.quantity}</span>
              </span>
              <span className="font-mono-price text-xs text-muted">
                {formatPrice(line.price * line.quantity)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-border pt-4 font-mono-price text-sm">
        <span className="uppercase tracking-widest text-muted">Total</span>
        <span className="text-foreground">{formatPrice(order.subtotal)}</span>
      </div>

      {/* returnStatus is a separate field from status — an order can
          be DELIVERED with a REQUESTED return still pending admin
          review, and stays that way until an admin approves/rejects
          it. Requesting a return here does not confirm a refund. */}
      {order.returnStatus && (
        <p
          className={`mt-3 font-mono-price text-[11px] uppercase tracking-widest ${
            order.returnStatus === "REJECTED" ? "text-muted" : "text-accent"
          }`}
        >
          Return {RETURN_LABEL[order.returnStatus] ?? order.returnStatus}
        </p>
      )}

      {actionError && (
        <p role="alert" className="mt-3 font-mono-price text-xs text-accent">
          {actionError}
        </p>
      )}

      {(!order.returnStatus || order.returnStatus === "REJECTED") &&
        (CANCELLABLE.includes(status) || RETURNABLE.includes(status)) && (
        <div className="mt-4 flex gap-4 border-t border-border pt-4">
          {CANCELLABLE.includes(status) && (
            <button
              onClick={handleCancel}
              disabled={busy}
              className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent disabled:opacity-40"
            >
              Cancel order
            </button>
          )}
          {RETURNABLE.includes(status) && (
            <button
              onClick={() => setShowReturnForm((s) => !s)}
              disabled={busy}
              className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent disabled:opacity-40"
            >
              {order.returnStatus === "REJECTED" ? "Request return again" : "Start a return"}
            </button>
          )}
        </div>
      )}

      {showReturnForm && (
        <div className="mt-4 space-y-3 rounded-soft border border-border p-4">
          <p className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
            This submits a return request for review — it doesn&apos;t confirm a
            refund. You&apos;ll see the status update once an admin approves or
            rejects it.
          </p>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Reason for return"
            rows={2}
            className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowReturnForm(false)}
              className="font-mono-price text-xs uppercase tracking-widest text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleReturn}
              disabled={busy || !returnReason.trim()}
              className="btn-fill rounded-pill border border-accent px-5 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit return"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
