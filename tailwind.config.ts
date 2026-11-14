import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "var(--bg-primary)",
          2: "var(--bg-secondary)",
          3: "var(--bg-tertiary)",
          4: "var(--bg-quaternary)",
        },
        border: {
          DEFAULT: "var(--border-primary)",
          light: "var(--border-light)",
        },
        ink: {
          DEFAULT: "var(--ink-primary)",
          2: "var(--ink-secondary)",
          3: "var(--ink-tertiary)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          dim: "var(--accent-dim)",
          hover: "var(--accent-hover)",
        },
        intent: {
          drinks: "#ffb74d",
          party: "#4285F4",
          chill: "#4db6ff",
          hookup: "#ff4d78",
        },
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        lg: "20px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 400ms ease forwards",
        "fade-in": "fadeIn 200ms ease forwards",
        spin: "spin 0.7s linear infinite",
        pulse: "pulse 2s ease-in-out infinite",
        "slide-up": "slideUp 250ms ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
