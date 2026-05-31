import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#0b0f0e",
        ivory: "#f7f1df",
        ink: "#101413",
        muted: "#b7c2ba",
        line: "#303934",
        clay: "#d39a67",
        mint: "#79d5be",
        gold: "#d7b767",
        champagne: "#efe0b2",
        blue: "#7ea3d1",
        night: "#171c1a"
      },
      borderRadius: {
        app: "8px"
      },
      boxShadow: {
        brand: "0 14px 40px rgba(16, 20, 19, 0.14)",
        insetGold: "inset 0 0 0 1px rgba(199, 164, 90, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
