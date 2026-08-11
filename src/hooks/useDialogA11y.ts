import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Shared behavior for every dialog/drawer/modal in the app (CartDrawer,
// NewProductForm) so each doesn't hand-roll its own Escape handling,
// focus trap, and focus restore — this is the one place that logic lives.
//
// - Escape closes the dialog.
// - Tab/Shift+Tab cycle within the dialog instead of escaping to the
//   page behind it.
// - Focus moves into the dialog once when it opens, and back to
//   whatever was focused before it opened once it closes.
// - Body scroll is locked while open, so the page behind an open
//   drawer/modal can't be scrolled with it.
export function useDialogA11y(isOpen: boolean, onClose: () => void) {
    const containerRef = useRef<HTMLElement | null>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    // Callers typically pass an inline arrow function for onClose, which
    // is a new reference on every render (e.g. NewProductForm re-renders
    // on every keystroke while its form state updates). Routing onClose
    // through a ref — updated every render but NOT part of the effect's
    // dependency array — means the effect below only reruns when `isOpen`
    // itself changes, not on every parent re-render. Without this, the
    // effect would refire on every keystroke and steal focus back to the
    // first focusable field (e.g. Name) each time, which is exactly the
    // bug this fixes: typing in "Color" or "SKU" was yanking focus to
    // the Name input after every character.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

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
                onCloseRef.current();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose is
        // read via onCloseRef intentionally; see comment above.
    }, [isOpen]);

    return containerRef;
}