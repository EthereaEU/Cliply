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
        primary: {
          DEFAULT: "rgb(59, 130, 246)",
          dark: "rgb(37, 99, 235)",
          light: "rgb(96, 165, 250)",
        },
        background: {
          DEFAULT: "rgb(10, 10, 10)",
          light: "rgb(20, 20, 20)",
          lighter: "rgb(30, 30, 30)",
        },
        surface: {
          DEFAULT: "rgb(25, 25, 25)",
          hover: "rgb(35, 35, 35)",
        },
        border: {
          DEFAULT: "rgb(40, 40, 40)",
          light: "rgb(50, 50, 50)",
        },
        accent: {
          DEFAULT: "rgb(37, 99, 235)",
          hover: "rgb(59, 130, 246)",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
