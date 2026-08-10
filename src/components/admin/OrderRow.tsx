"use client";

import { useState } from "react";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/currency";

// PATCH /admin/orders/:id/status only accepts these three — cancel and
// return go through their own dedicated endpoints, never through this
// field. PENDING and CANCELLED are real values an order can be in (set
// by order creation / customer cancel) but aren't offered here since
// this dropdown can't set them.
const STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED"];

const RETURN_LABEL: Record<string, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function OrderRow({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [returnStatus, setReturnStatus] = useState(order.returnStatus ?? null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleChange = async (next: string) => {
    setStatus(next);
    setSaving(true);
    setActionError(null);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status: next }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      const body = await res?.json().catch(() => ({}));
      setActionError(body?.error || "Couldn't update status.");
    }
  };

  const handleApproveReturn = async () => {
    setSaving(true);
    setActionError(null);
    const res = await fetch(`/api/admin/orders/${order.id}/approve-return`, {
      method: "POST",
    }).catch(() => null);
    setSaving(false);
    if (res?.ok) {
      setReturnStatus("APPROVED");
    } else {
      const body = await res?.json().catch(() => ({}));
      setActionError(body?.error || "Couldn't approve the return.");
    }
  };

  const handleRejectReturn = async () => {
    if (!confirm("Reject this return request?")) return;
    setSaving(true);
    setActionError(null);
    const res = await fetch(`/api/admin/orders/${order.id}/reject-return`, {
      method: "POST",
    }).catch(() => null);
    setSaving(false);
    if (res?.ok) {
      setReturnStatus("REJECTED");
    } else {
      const body = await res?.json().catch(() => ({}));
      setActionError(body?.error || "Couldn't reject the return.");
    }
  };

  return (
    <tr className="border-b border-border last:border-0 align-top">
      <td className="px-5 py-4 font-mono-price text-xs text-foreground">
        #{order.id}
      </td>
      <td className="px-5 py-4 text-sm text-muted">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-4 text-sm text-foreground">
        {order.lines.reduce((n, l) => n + l.quantity, 0)} items
      </td>
      <td className="px-5 py-4 font-mono-price text-sm text-foreground">
        {formatPrice(order.subtotal)}
      </td>
      <td className="px-5 py-4">
        <select
          value={STATUSES.includes(status) ? status : ""}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          className="rounded-sharp border border-border bg-transparent px-3 py-1.5 font-mono-price text-[11px] uppercase tracking-widest text-foreground disabled:opacity-40"
        >
          {!STATUSES.includes(status) && (
            <option value="" disabled className="bg-surface">
              {status}
            </option>
          )}
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-surface">
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-5 py-4">
        {/* returnStatus is independent of status — an order can be
            DELIVERED and have a REQUESTED return sitting on top of it. */}
        {returnStatus === "REQUESTED" ? (
          <div className="flex flex-col gap-2">
            <span className="font-mono-price text-[10px] uppercase tracking-widest text-accent">
              Return requested
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleApproveReturn}
                disabled={saving}
                className="font-mono-price text-[11px] uppercase tracking-widest text-accent hover:opacity-70 disabled:opacity-40"
              >
                Approve
              </button>
              <button
                onClick={handleRejectReturn}
                disabled={saving}
                className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </div>
        ) : returnStatus ? (
          <span className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
            Return {RETURN_LABEL[returnStatus] ?? returnStatus}
          </span>
        ) : null}
        {actionError && (
          <p role="alert" className="mt-1 font-mono-price text-[10px] text-accent">
            {actionError}
          </p>
        )}
      </td>
    </tr>
  );
}
