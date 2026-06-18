/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
      },
      colors: {
        // ── Crypto terminal core surfaces ──────────────────────────────
        surface: "#0a0f1e",
        "surface-dim": "#080c18",
        "surface-bright": "#1c2438",
        "surface-container-lowest": "#070b16",
        "surface-container-low": "#0d1322",
        "surface-container": "#111828",
        "surface-container-high": "#172033",
        "surface-container-highest": "#1f2a42",
        "on-surface": "#e6ecf7",
        "on-surface-variant": "#8a98b5",
        "inverse-surface": "#e6ecf7",
        "inverse-on-surface": "#111828",
        outline: "#56627d",
        "outline-variant": "#283248",
        "surface-tint": "#22d3ee",
        // ── Primary: crisp electric cyan ──────────────────────────────
        primary: "#22d3ee",
        "on-primary": "#00222b",
        "primary-container": "#0e7490",
        "on-primary-container": "#a5f3fc",
        "inverse-primary": "#0891b2",
        // ── Secondary: restrained indigo / slate violet ──────────────
        secondary: "#a5b4fc",
        "on-secondary": "#1e1b4b",
        "secondary-container": "#312e81",
        "on-secondary-container": "#c7d2fe",
        // ── Tertiary: amber (warnings / fear-greed) ──────────────────
        tertiary: "#fbbf24",
        "on-tertiary": "#451a03",
        "tertiary-container": "#b45309",
        "on-tertiary-container": "#fde68a",
        // ── Error / bearish: true red ────────────────────────────────
        error: "#f87171",
        "on-error": "#450a0a",
        "error-container": "#7f1d1d",
        "on-error-container": "#fecaca",
        background: "#0a0f1e",
        "on-background": "#e6ecf7",
        "surface-variant": "#1f2a42",
        // ── Semantic market colors (true green / red) ────────────────
        "bullish-green": "#34d399",
        "bearish-red": "#f87171",
        // ── Aliases consumed across the data screens (markets / heatmap
        //    / portfolio / alerts / compare). Previously undefined, so
        //    those pages rendered unstyled — now mapped to the terminal
        //    palette in one place. ─────────────────────────────────────
        "bg-dark": "#0a0f1e",
        "bg-card": "#111828",
        card: "#111828",
        "accent-cyan": "#22d3ee",
        "accent-purple": "#a5b4fc",
        "text-secondary": "#8a98b5",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        gutter: "24px",
        margin: "32px",
        "container-max": "1440px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px",
      },
      fontFamily: {
        geist: ["Geist", "system-ui", "sans-serif"],
        manrope: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "monospace"],
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "label-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.03em", fontWeight: "600" }],
      },
      maxWidth: {
        "container-max": "1440px",
      },
    },
  },
  plugins: [],
};
