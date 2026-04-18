"use client";

import { Counter } from "@/components/marketing/primitives/Counter";

export function StatRibbon() {
  const stats = [
    { to: 847321, suffix: "", label: "VIDEOS POSTED" },
    { to: 2400, suffix: "M", label: "VIEWS GENERATED" },
    { to: 12400, suffix: "+", label: "HOURS SAVED" },
    { to: 66, suffix: "", label: "CONTENT STYLES", fire: true },
  ];

  return (
    <section
      className="sec-pad-sm"
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="wrap-wide">
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 32,
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className="counter" style={{ color: s.fire ? "var(--fire)" : "var(--text-1)" }}>
                <Counter to={s.to} />
                {s.suffix}
              </div>
              <div
                className="mono mt-2"
                style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--text-3)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
