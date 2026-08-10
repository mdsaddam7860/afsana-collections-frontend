import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  addItem: (line: CartLine) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (line) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === line.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === line.variantId
                  ? { ...i, quantity: i.quantity + line.quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, line], isOpen: true };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    { name: "larkspur-cart" }
  )
);

// Derived selectors — compute in components via these to avoid extra re-renders
export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectItemCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);
