import type { Config } from "tailwindcss";

/**
 * Maps Tailwind utilities to the CSS variable system defined in globals.css.
 * Import this into tailwind.config.ts:
 *   import { themeExtension } from "./theme.config";
 *   export default { ..., theme: { extend: themeExtension } }
 */
export const themeExtension: Config["theme"] = {
  extend: {
    colors: {
      background: "hsl(var(--background))",
      surface: "hsl(var(--surface))",
      "surface-raised": "hsl(var(--surface-raised))",
      foreground: "hsl(var(--foreground))",
      muted: "hsl(var(--muted))",
      border: "hsl(var(--border))",
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      clay: "hsl(var(--clay))",
    },
    fontFamily: {
      display: ["var(--font-display)", "Fraunces", "serif"],
      body: ["var(--font-body)", "Archivo", "sans-serif"],
      mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
    },
    borderRadius: {
      sharp: "var(--radius-sharp)",
      soft: "var(--radius-soft)",
      pill: "var(--radius-pill)",
    },
    boxShadow: {
      ambient: "0 40px 80px -30px hsl(var(--shadow) / 0.6)",
      lift: "0 20px 40px -15px hsl(var(--shadow) / 0.5)",
      hairline: "0 0 0 1px hsl(var(--border))",
    },
    animation: {
      "mesh-drift": "mesh-drift 22s ease-in-out infinite alternate",
      "reveal-up": "reveal-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      "stagger-up": "stagger-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      "badge-pulse": "badge-pulse 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
};

export default themeExtension;
