"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/store/preferences-store";

// Applies the persisted theme (zustand + localStorage, see
// store/preferences-store.ts) to <html data-theme="..."> so globals.css's
// [data-theme="..."] variable overrides take effect. Runs client-side
// after hydration — first paint briefly uses the default "linen"
// palette before this effect fires, which is an acceptable flash for a
// locally-stored preference rather than SSR-blocking on localStorage.
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = usePreferencesStore((s) => s.theme);
  const reduceMotion = usePreferencesStore((s) => s.reduceMotion);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  return <>{children}</>;
}
