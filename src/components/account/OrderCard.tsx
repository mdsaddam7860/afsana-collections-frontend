"use client";

import { useState } from "react";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/currency";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/store/toast-store";

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
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const status = order.status.toUpperCase();

  const handleCancel = async () => {
    setBusy(true);
    setActionError(null);
    const res = await fetch(`/api/orders/${order.id}/cancel`, {
      method: "POST",
    });
    setBusy(false);
    setConfirmingCancel(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body.error || "Couldn't cancel this order.";
      setActionError(message);
      toast.error(message);
      return;
    }
    toast.success("Order cancelled.");
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
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-foreground">
              {item.productName}
              {item.variantName ? ` — ${item.variantName}` : ""}{" "}
              <span className="text-muted">× {item.quantity}</span>
            </span>
            <span className="font-mono-price text-xs text-muted">
              {formatPrice(item.totalPrice)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1.5 border-t border-border pt-4 font-mono-price text-xs text-muted">
        <div className="flex justify-between">
          <span className="uppercase tracking-widest">Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.shippingAmount > 0 && (
          <div className="flex justify-between">
            <span className="uppercase tracking-widest">Shipping</span>
            <span>{formatPrice(order.shippingAmount)}</span>
          </div>
        )}
        {order.taxAmount > 0 && (
          <div className="flex justify-between">
            <span className="uppercase tracking-widest">Tax</span>
            <span>{formatPrice(order.taxAmount)}</span>
          </div>
        )}
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-accent">
            <span className="uppercase tracking-widest">Discount</span>
            <span>−{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-1.5 text-sm text-foreground">
          <span className="font-mono-price uppercase tracking-widest">
            Total
          </span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
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
                onClick={() => setConfirmingCancel(true)}
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
                {order.returnStatus === "REJECTED"
                  ? "Request return again"
                  : "Start a return"}
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

      <ConfirmDialog
        open={confirmingCancel}
        title="Cancel this order?"
        description="This can't be undone — you'll need to place a new order if you change your mind."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        busy={busy}
        onConfirm={handleCancel}
        onCancel={() => setConfirmingCancel(false)}
      />
    </div>
  );
}
