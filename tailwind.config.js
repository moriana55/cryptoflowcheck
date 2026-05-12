/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#07090F",
        "bg-card": "rgba(18, 22, 33, 0.7)",
        "accent-cyan": "#00F2FF",
        "accent-purple": "#9D00FF",
        "text-secondary": "#8E96A4",
        "glass-border": "rgba(0, 242, 255, 0.1)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
        mono: ["Roboto Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
