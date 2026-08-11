import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Shared behavior for every dialog/drawer/modal in the app (CartDrawer,
// NewProductForm) so each doesn't hand-roll its own Escape handling,
// focus trap, and focus restore — this is the one place that logic lives.
//
// - Escape closes the dialog.
// - Tab/Shift+Tab cycle within the dialog instead of escaping to the
//   page behind it.
// - Focus moves into the dialog on open, and back to whatever was
//   focused before it opened once it closes.
// - Body scroll is locked while open, so the page behind an open
//   drawer/modal can't be scrolled with it.
export function useDialogA11y(isOpen: boolean, onClose: () => void) {
    const containerRef = useRef<HTMLElement | null>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        previousFocus.current = document.activeElement as HTMLElement | null;
        const container = containerRef.current;
        const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
        focusable?.[0]?.focus();

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !container) return;
            const items = container.querySelectorAll<HTMLElement>(FOCUSABLE);
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
            previousFocus.current?.focus();
        };
    }, [isOpen, onClose]);

    return containerRef;
}