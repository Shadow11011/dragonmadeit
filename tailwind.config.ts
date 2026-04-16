import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        "bg-primary": "#0f0d0b",
        "bg-secondary": "#171412",
        "bg-tertiary": "#201c18",
        "accent-fire": "#ff4500",
        "accent-ember": "#ff8c00",
        "accent-gold": "#ffd700",
        "text-primary": "#ece9e5",
        "text-secondary": "#807a73",
        border: "#302c27",
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
