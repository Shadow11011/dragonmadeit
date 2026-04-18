"use client";

import { useMemo } from "react";

export function EmberField({ count = 30 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 10,
        dx: (Math.random() - 0.5) * 80,
        size: 2 + Math.random() * 3,
        op: 0.4 + Math.random() * 0.6,
      })),
    [count]
  );

  return (
    <div className="embers" aria-hidden="true">
      {embers.map((e, i) => (
        <div
          key={i}
          className="ember"
          style={
            {
              left: `${e.left}%`,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              opacity: e.op,
              "--dx": `${e.dx}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
