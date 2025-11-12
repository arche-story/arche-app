import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "arche-navy": "#0C1B33",
        "arche-gold": "#F8E473",
      },
    },
  },
  plugins: [],
};

export default config;
