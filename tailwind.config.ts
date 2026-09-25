import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#0a0b0e",
        "surface-container-low": "#111318",
        "surface-container": "#161922",
        "surface-container-high": "#1f2330",
        "surface-container-highest": "#282e3f",
        surface: "#0d0e12",
        background: "#090a0d",
        "outline-variant": "#222736",
        outline: "#363e54",
        "on-surface": "#e6e8ee",
        "on-surface-variant": "#8e96aa",
        primary: "#06b6d4",
        "primary-container": "#0891b2",
        "on-primary": "#002b33",
        secondary: "#10b981",
        "secondary-container": "#059669",
        tertiary: "#f59e0b",
        "tertiary-container": "#d97706",
        error: "#ef4444",
      },
      fontFamily: {
        sans: ["Geist", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
