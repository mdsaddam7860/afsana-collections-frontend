"use client";

import { useToastStore } from "@/store/toast-store";

const VARIANT_STYLES: Record<string, string> = {
  success: "border-accent text-accent",
  error: "border-red-400/60 text-red-300",
  info: "border-border text-foreground",
};

// Mounted once in the root layout — every toast.success/error/info() call
// anywhere in the app renders here. Never instantiate a second one; that's
// exactly the "separate notification implementation per component"
// pattern this is meant to replace.
export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`glass-panel pointer-events-auto flex max-w-sm items-center gap-3 rounded-pill border px-5 py-3 shadow-ambient transition-all duration-300 ${
            VARIANT_STYLES[t.variant]
          }`}
        >
          <p className="font-mono-price text-xs">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
