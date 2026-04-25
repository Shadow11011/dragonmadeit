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
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        // Cool-neutral dark palette. Names retained for backwards
        // compatibility — accent-fire/-ember/-gold now point at the
        // single blue accent ramp.
        "bg-primary": "#0a0a0a",
        "bg-secondary": "#18181b",
        "bg-tertiary": "#27272a",
        "accent-fire": "#3b82f6",
        "accent-ember": "#60a5fa",
        "accent-gold": "#93c5fd",
        accent: "#3b82f6",
        "accent-hover": "#60a5fa",
        "text-primary": "#fafafa",
        "text-secondary": "#a1a1aa",
        border: "#27272a",
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      backgroundImage: {
        // Legacy name retained — flat single-color now (no fire blend).
        "fire-gradient": "linear-gradient(to right, #3b82f6, #3b82f6, #60a5fa)",
      },
      boxShadow: {
        // glow-fire utility legacy name; now a soft blue ring.
        "glow-fire": "0 0 0 0 transparent",
      },
    },
  },
  plugins: [],
};

export default config;
