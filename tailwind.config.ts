import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        card: "var(--color-bg-card)",
        "card-hover": "var(--color-bg-card-hover)",
        fg: "var(--color-fg)",
        muted: "var(--color-fg-muted)",
        accent: "var(--color-accent)",
        "accent-fg": "var(--color-accent-fg)",
        border: "var(--color-border)",
        "accent-glow": "var(--color-accent-glow)",
      },
      boxShadow: {
        glow: "0 0 25px -5px var(--color-accent-glow)",
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
