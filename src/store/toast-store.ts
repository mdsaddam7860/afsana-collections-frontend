import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastState {
    toasts: Toast[];
    show: (message: string, variant?: ToastVariant) => void;
    dismiss: (id: string) => void;
}

// Not persisted (unlike cart/wishlist) — toasts are ephemeral, session-only
// UI state, never meant to survive a reload.
export const useToastStore = create<ToastState>()((set) => ({
    toasts: [],
    show: (message, variant = "info") => {
        const id = crypto.randomUUID();
        set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
        // Auto-dismiss after 4s — ToastContainer also lets the user dismiss
        // manually, this is just the default lifetime.
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 4000);
    },
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers so call sites read as `toast.success("Added to bag")`
// rather than `useToastStore.getState().show(..., "success")` everywhere —
// this is the ONE notification implementation the whole app should use
// (per the "don't create separate implementations per component" rule).
export const toast = {
    success: (message: string) => useToastStore.getState().show(message, "success"),
    error: (message: string) => useToastStore.getState().show(message, "error"),
    info: (message: string) => useToastStore.getState().show(message, "info"),
};