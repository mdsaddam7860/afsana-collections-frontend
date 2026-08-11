import type { Config } from "tailwindcss";
import { themeExtension } from "./src/theme.config";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: themeExtension?.extend || {},
  },
  plugins: [],
};

export default config;
