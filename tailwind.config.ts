import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0a0a0f",
        "bg-secondary": "#12121a",
        "bg-tertiary": "#1a1a2e",
        "accent-fire": "#ff4500",
        "accent-ember": "#ff8c00",
        "accent-gold": "#ffd700",
        "text-primary": "#e4e4e7",
        "text-secondary": "#71717a",
        border: "#27272a",
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      backgroundImage: {
        "fire-gradient": "linear-gradient(to right, #ff8c00, #ff4500, #ffd700)",
      },
    },
  },
  plugins: [],
};

export default config;
