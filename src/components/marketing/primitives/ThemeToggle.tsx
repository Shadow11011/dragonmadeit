"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = (localStorage.getItem("dmi-theme") as "dark" | "light" | null) || "dark";
      setMode(stored);
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("dmi-theme", mode);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode, mounted]);

  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label="Toggle theme"
      title={mode === "dark" ? "Switch to light" : "Switch to dark"}
      suppressHydrationWarning
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-knob" data-mode={mode}>
          {mode === "dark" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
              </g>
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
