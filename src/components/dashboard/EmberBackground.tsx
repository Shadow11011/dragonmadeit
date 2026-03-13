"use client";

import { useMemo } from "react";

interface Ember {
  id: number;
  left: string;
  size: number;
  color: string;
  animationDuration: string;
  animationDelay: string;
}

const EMBER_COLORS = ["#ff4500", "#ff8c00", "#ffd700"];

export function EmberBackground() {
  const embers = useMemo<Ember[]>(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${5 + ((i * 7 + 3) % 90)}%`,
      size: 2 + (i % 3) * 2,
      color: EMBER_COLORS[i % EMBER_COLORS.length],
      animationDuration: `${6 + (i % 5) * 2}s`,
      animationDelay: `${(i * 1.3) % 8}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-[-10px] rounded-full"
          style={{
            left: ember.left,
            width: ember.size,
            height: ember.size,
            backgroundColor: ember.color,
            animation: `ember-float ${ember.animationDuration} ease-in infinite`,
            animationDelay: ember.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
