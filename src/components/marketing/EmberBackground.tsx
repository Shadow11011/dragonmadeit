"use client";

/**
 * EmberBackground — Full-page CSS-only ember particle effect.
 * Renders 80 ember particles rising from the bottom of the viewport.
 * Fixed position, behind all content, non-interactive.
 *
 * Particle types:
 * - Sparks: very small (2px), fast, dim — background depth
 * - Standard embers: medium (3-5px), moderate speed — core effect
 * - Glowing embers: larger (5-7px), slow, warm — focal interest
 * - Pop particles: extra-bright, larger glow radius — highlight accents
 *
 * On mobile (<640px), odd-indexed particles are hidden via CSS (~40 shown).
 *
 * "Always cooking" — embers constantly floating upward like a forge.
 */

const EMBER_COLORS = [
  "#ff4500",  // fire orange-red
  "#ff8c00",  // warm amber
  "#ffd700",  // gold
  "#ff6b35",  // soft orange
  "#cc3700",  // deep ember red
] as const;

type EmberType = "spark" | "standard" | "glow" | "pop";

interface EmberConfig {
  id: number;
  left: string;
  size: number;
  color: string;
  opacity: number;
  duration: string;
  delay: string;
  drift: number;
  blur: number;
  type: EmberType;
  glowMultiplier: number;
}

function getEmberType(i: number, count: number): EmberType {
  // ~8 pop particles spread throughout
  if (i % 10 === 0 && i < 80) return "pop";
  // ~20 sparks — every 4th particle
  if (i % 4 === 1) return "spark";
  // ~12 glowing embers — every 7th
  if (i % 7 === 0) return "glow";
  // rest are standard
  return "standard";
}

function generateEmbers(count: number): EmberConfig[] {
  const embers: EmberConfig[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i / count;
    const type = getEmberType(i, count);

    let size: number;
    let opacity: number;
    let durationBase: number;
    let blur: number;
    let glowMultiplier: number;

    switch (type) {
      case "spark":
        // Very small, fast, dim — like sparks flying off metal
        size = 2 + (i % 2) * 0.5;
        opacity = 0.2 + (i % 3) * 0.08;
        durationBase = 4 + (i % 4) * 1.2;
        blur = 0.3;
        glowMultiplier = 0.5;
        break;
      case "glow":
        // Larger, slower, warm — like glowing coals floating up
        size = 5 + (i % 3) * 0.8;
        opacity = 0.5 + (i % 3) * 0.12;
        durationBase = 10 + (i % 5) * 2;
        blur = 1.5;
        glowMultiplier = 2;
        break;
      case "pop":
        // Extra-bright accent particles with strong glow
        size = 5 + (i % 3) * 1;
        opacity = 0.7 + (i % 3) * 0.1;
        durationBase = 8 + (i % 4) * 1.5;
        blur = 0.5;
        glowMultiplier = 3.5;
        break;
      default: // "standard"
        // Medium embers — the bread and butter
        size = 3 + (i % 4) * 0.7;
        opacity = 0.35 + (i % 5) * 0.1;
        durationBase = 7 + (i % 7) * 1.5;
        blur = i % 4 === 0 ? 1.2 : i % 3 === 0 ? 0.8 : 0.4;
        glowMultiplier = 1.2;
        break;
    }

    // Color selection: sparks get dimmer/deeper colors, pops get brighter ones
    let colorIndex: number;
    if (type === "spark") {
      colorIndex = i % 2 === 0 ? 4 : 0; // deep red or fire orange
    } else if (type === "pop") {
      colorIndex = i % 2 === 0 ? 2 : 1; // gold or amber
    } else {
      colorIndex = i % EMBER_COLORS.length;
    }

    embers.push({
      id: i,
      left: `${2 + seed * 96}%`,
      size,
      color: EMBER_COLORS[colorIndex],
      opacity,
      duration: `${durationBase}s`,
      delay: `${(i * 0.45) % 14}s`,
      drift: (i % 2 === 0 ? 1 : -1) * (6 + (i % 6) * 5),
      blur,
      type,
      glowMultiplier,
    });
  }
  return embers;
}

const EMBERS = generateEmbers(80);

export function EmberBackground() {
  return (
    <div
      className="ember-background"
      aria-hidden="true"
    >
      {EMBERS.map((ember) => {
        const glowSize = ember.size * ember.glowMultiplier;
        return (
          <div
            key={ember.id}
            className={`ember-particle${ember.type === "pop" ? " ember-pop" : ""}`}
            style={{
              left: ember.left,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              backgroundColor: ember.color,
              boxShadow: `0 0 ${glowSize * 2}px ${glowSize}px ${ember.color}40, 0 0 ${glowSize * 3}px ${glowSize * 1.5}px ${ember.color}20`,
              filter: `blur(${ember.blur}px)`,
              animationDuration: ember.duration,
              animationDelay: ember.delay,
              ["--ember-drift" as string]: `${ember.drift}px`,
              ["--ember-opacity" as string]: ember.opacity,
            }}
          />
        );
      })}

      <style>{`
        .ember-background {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          contain: strict;
        }

        .ember-particle {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          opacity: 0;
          animation: ember-rise linear infinite;
          will-change: transform, opacity;
        }

        .ember-pop {
          animation-name: ember-rise-pop;
        }

        @keyframes ember-rise {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          5% {
            opacity: var(--ember-opacity, 0.5);
          }
          30% {
            transform: translateY(-30vh) translateX(calc(var(--ember-drift, 10px) * 0.5)) scale(0.95);
            opacity: var(--ember-opacity, 0.5);
          }
          60% {
            transform: translateY(-60vh) translateX(var(--ember-drift, 10px)) scale(0.7);
            opacity: calc(var(--ember-opacity, 0.5) * 0.7);
          }
          85% {
            transform: translateY(-85vh) translateX(calc(var(--ember-drift, 10px) * 0.8)) scale(0.4);
            opacity: calc(var(--ember-opacity, 0.5) * 0.3);
          }
          100% {
            transform: translateY(-105vh) translateX(calc(var(--ember-drift, 10px) * 0.6)) scale(0.2);
            opacity: 0;
          }
        }

        @keyframes ember-rise-pop {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          4% {
            opacity: var(--ember-opacity, 0.7);
          }
          15% {
            transform: translateY(-15vh) translateX(calc(var(--ember-drift, 10px) * 0.3)) scale(1.15);
            opacity: var(--ember-opacity, 0.7);
          }
          35% {
            transform: translateY(-35vh) translateX(calc(var(--ember-drift, 10px) * 0.6)) scale(0.9);
            opacity: calc(var(--ember-opacity, 0.7) * 0.85);
          }
          60% {
            transform: translateY(-60vh) translateX(var(--ember-drift, 10px)) scale(0.6);
            opacity: calc(var(--ember-opacity, 0.7) * 0.5);
          }
          85% {
            transform: translateY(-85vh) translateX(calc(var(--ember-drift, 10px) * 0.8)) scale(0.35);
            opacity: calc(var(--ember-opacity, 0.7) * 0.2);
          }
          100% {
            transform: translateY(-105vh) translateX(calc(var(--ember-drift, 10px) * 0.6)) scale(0.15);
            opacity: 0;
          }
        }

        /* On mobile: hide odd-indexed particles (~40 shown) */
        @media (max-width: 640px) {
          .ember-particle:nth-child(2n) {
            display: none;
          }
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .ember-particle {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
