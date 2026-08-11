"use client";

import { useDialogA11y } from "@/hooks/useDialogA11y";
import { toast } from "@/store/toast-store";

// Replaces every window.confirm()/alert() in the app with a branded,
// accessible dialog — native confirm()/alert() can't be styled, blocks
// the entire tab (including any pending async UI), and looks jarring
// next to the rest of the app's design.
//
// Usage pattern (see OrderCard.tsx, InventoryTable.tsx, etc.):
//   const [confirming, setConfirming] = useState(false);
//   <ConfirmDialog
//     open={confirming}
//     title="Cancel this order?"
//     description="This can't be undone."
//     confirmLabel="Cancel order"
//     onConfirm={handleCancel}
//     onCancel={() => setConfirming(false)}
//   />
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Never mind",
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useDialogA11y(open, onCancel);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        ref={dialogRef as React.RefObject<HTMLDivElement>}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={
          description ? "confirm-dialog-description" : undefined
        }
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-soft border border-border bg-background p-6"
      >
        <h3
          id="confirm-dialog-title"
          className="font-display text-lg italic text-foreground"
        >
          {title}
        </h3>
        {description && (
          <p
            id="confirm-dialog-description"
            className="mt-2 text-sm text-muted"
          >
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="font-mono-price text-xs uppercase tracking-widest text-muted hover:text-foreground disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-pill border px-5 py-2 font-mono-price text-xs uppercase tracking-widest transition-colors disabled:opacity-50 ${
              destructive
                ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                : "border-foreground/40 text-foreground hover:bg-foreground/10"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Small helper so call sites that only need a fire-and-forget failure
// notice (formerly `alert(...)`) can use the same toast system as
// everything else, instead of a second, jarring browser-native alert.
export function notifyError(message: string) {
  toast.error(message);
}
