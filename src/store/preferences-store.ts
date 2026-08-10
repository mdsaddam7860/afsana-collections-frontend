import { create } from "zustand";
import { persist } from "zustand/middleware";

// Three palettes as CSS variable sets — see globals.css for the actual
// [data-theme="..."] color values. "nocturne" is the original design;
// "linen" and "clay" are added light/warm alternatives.
export const THEMES = [
  { id: "nocturne", label: "Nocturne", description: "Plum-black, copper accent (default)" },
  { id: "linen", label: "Linen", description: "Warm off-white, soft and airy" },
  { id: "clay", label: "Clay", description: "Terracotta and cream, daylight-friendly" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

interface PreferencesState {
  theme: ThemeId;
  // Display-only preference — does NOT change what currency is sent to
  // the backend/Stripe (see lib/constants.ts CHECKOUT_DEFAULTS.currency
  // for that). This only affects how prices are formatted on screen.
  reduceMotion: boolean;
  setTheme: (theme: ThemeId) => void;
  setReduceMotion: (value: boolean) => void;
}

// Persisted under its own localStorage key ("larkspur-preferences"),
// separate from cart/wishlist state, so preferences survive a
// "clear cart" or account switch without being wiped incidentally.
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "nocturne",
      reduceMotion: false,
      setTheme: (theme) => set({ theme }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "larkspur-preferences" }
  )
);
