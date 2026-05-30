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
        paper: "#f3eee2",
        ivory: "#fffaf0",
        ink: "#101413",
        muted: "#64706a",
        line: "#d9cfbd",
        clay: "#9b6a3b",
        mint: "#6fb8a4",
        gold: "#c7a45a",
        champagne: "#ead7a2",
        blue: "#526f91",
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
