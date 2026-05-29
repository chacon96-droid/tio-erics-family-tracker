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
        paper: "#f7f3ea",
        ink: "#1e2524",
        muted: "#65706d",
        line: "#d8d0c2",
        clay: "#bd735c",
        mint: "#79b8a6",
        gold: "#d6a94f",
        blue: "#5d7ea6"
      },
      borderRadius: {
        app: "8px"
      }
    }
  },
  plugins: []
};

export default config;
