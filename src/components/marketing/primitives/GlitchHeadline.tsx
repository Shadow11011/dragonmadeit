"use client";

import { useEffect, useRef, useState } from "react";

export function GlitchHeadline({
  text,
  className = "h-mega",
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const chars = "▓▒░█▍▉◢◣◤◥⌁∆Ω§¤";
    let t = 0;
    const animate = () => {
      t++;
      if (t < 30) {
        setDisplay(
          text
            .split("")
            .map((c) =>
              c === " " ? " " : Math.random() < 0.15 ? chars[Math.floor(Math.random() * chars.length)] : c
            )
            .join("")
        );
        raf.current = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
      }
    };
    animate();
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [text]);

  return <h1 className={className}>{display}</h1>;
}
