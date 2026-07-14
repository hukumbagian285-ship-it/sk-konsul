/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#F8FAFC",
        },
        accent: {
          DEFAULT: "#059669",
          foreground: "#F8FAFC",
        },
        warning: {
          DEFAULT: "#B45309",
          foreground: "#F8FAFC",
        },
        background: "#F8FAFC",
        foreground: "#0F172A",
        card: "#FFFFFF",
        border: "#E2E8F0",
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
