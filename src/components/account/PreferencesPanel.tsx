"use client";

import { THEMES, usePreferencesStore } from "@/store/preferences-store";

// Everything here is stored client-side only (localStorage via
// zustand persist, key "larkspur-preferences") — no backend call, no
// accessToken required. Intentional: theme/display preferences are
// per-device UI state, not account data that needs to sync across
// devices or survive a cleared browser.
export default function PreferencesPanel() {
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const reduceMotion = usePreferencesStore((s) => s.reduceMotion);
  const setReduceMotion = usePreferencesStore((s) => s.setReduceMotion);

  return (
    <div>
      <h2 className="font-display text-fluid-h2 italic text-foreground">
        Preferences
      </h2>
      <p className="mt-2 font-mono-price text-[11px] uppercase tracking-widest text-muted">
        Saved on this device only
      </p>

      <div className="mt-8">
        <p className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
          Theme
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
              className={`rounded-soft border p-4 text-left transition-colors ${
                theme === t.id
                  ? "border-accent bg-surface-raised"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <span className="font-display text-lg italic text-foreground">
                {t.label}
              </span>
              <span className="mt-1 block font-mono-price text-[11px] text-muted">
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between rounded-soft border border-border p-4">
        <div>
          <p className="text-sm text-foreground">Reduce motion</p>
          <p className="mt-1 font-mono-price text-[11px] text-muted">
            Turns off page animations and transitions.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reduceMotion}
          onClick={() => setReduceMotion(!reduceMotion)}
          className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${
            reduceMotion ? "bg-accent" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
              reduceMotion ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
