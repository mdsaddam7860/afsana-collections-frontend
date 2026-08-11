"use client";

import { useState } from "react";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/currency";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/store/toast-store";

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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-top">
      <span className="font-mono-price text-[10px] uppercase tracking-widest text-muted md:hidden">
        {label}
      </span>
      <span className="text-right md:text-left">{children}</span>
    </div>
  );
}

export default function OrderRow({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [returnStatus, setReturnStatus] = useState(order.returnStatus ?? null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingReject, setConfirmingReject] = useState(false);

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
    setSaving(true);
    setActionError(null);
    const res = await fetch(`/api/admin/orders/${order.id}/reject-return`, {
      method: "POST",
    }).catch(() => null);
    setSaving(false);
    setConfirmingReject(false);
    if (res?.ok) {
      setReturnStatus("REJECTED");
      toast.success("Return rejected.");
    } else {
      const body = await res?.json().catch(() => ({}));
      const message = body?.error || "Couldn't reject the return.";
      setActionError(message);
      toast.error(message);
    }
  };

  return (
    <div className="px-4 py-3 md:table-row md:border-b md:border-border md:px-0 md:py-0 md:align-top md:last:border-0">
      <Field label="Order">
        <span className="font-mono-price text-xs text-foreground">#{order.id}</span>
      </Field>
      <Field label="Date">
        <span className="text-sm text-muted">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </Field>
      <Field label="Items">
        <span className="text-sm text-foreground">
          {order.items.reduce((n, item) => n + item.quantity, 0)} items
        </span>
      </Field>
      <Field label="Total">
        <span className="font-mono-price text-sm text-foreground">
          {formatPrice(order.totalAmount)}
        </span>
      </Field>
      <Field label="Status">
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
      </Field>
      <div className="pt-1.5 md:table-cell md:px-5 md:py-4 md:align-top">
        {/* returnStatus is independent of status — an order can be
            DELIVERED and have a REQUESTED return sitting on top of it. */}
        {returnStatus === "REQUESTED" ? (
          <div className="flex flex-col items-end gap-2 md:items-start">
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
                onClick={() => setConfirmingReject(true)}
                disabled={saving}
                className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </div>
        ) : returnStatus ? (
          <span className="block text-right font-mono-price text-[11px] uppercase tracking-widest text-muted md:text-left">
            Return {RETURN_LABEL[returnStatus] ?? returnStatus}
          </span>
        ) : null}
        {actionError && (
          <p
            role="alert"
            className="mt-1 text-right font-mono-price text-[10px] text-accent md:text-left"
          >
            {actionError}
          </p>
        )}
        <ConfirmDialog
          open={confirmingReject}
          title="Reject this return request?"
          description="The customer will be notified their return wasn't approved."
          confirmLabel="Reject return"
          cancelLabel="Never mind"
          busy={saving}
          onConfirm={handleRejectReturn}
          onCancel={() => setConfirmingReject(false)}
        />
      </div>
    </div>
  );
}
