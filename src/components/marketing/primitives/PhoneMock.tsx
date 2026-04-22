"use client";

import { useEffect, useState } from "react";

export const STORIES = [
  {
    kind: "REDDIT",
    hook: '"AITA for telling my mom to stop reading my diary at 32?"',
    handle: "@redditvault",
    tag: "#redditstories",
    views: "2.4M",
    bg: "linear-gradient(165deg, #1a0f2e 0%, #3d1a4a 60%, #ff4500 130%)",
    pattern: "dots" as const,
  },
  {
    kind: "HORROR",
    hook: "Never open the door after 3 knocks. Ever.",
    handle: "@midnightlore",
    tag: "#creepypasta",
    views: "891K",
    bg: "linear-gradient(165deg, #0a0a0a 0%, #2a0505 60%, #8b0000 130%)",
    pattern: "scan" as const,
  },
  {
    kind: "TRUE CRIME",
    hook: "They found the cabin. What was inside changed everything.",
    handle: "@darkfilesdaily",
    tag: "#truecrime",
    views: "4.1M",
    bg: "linear-gradient(165deg, #141420 0%, #1a2540 60%, #d4a017 130%)",
    pattern: "grid" as const,
  },
  {
    kind: "MOTIVATION",
    hook: "Broke at 23. CEO at 30. The one decision that flipped it.",
    handle: "@mindforge",
    tag: "#mindset",
    views: "1.2M",
    bg: "linear-gradient(165deg, #0a1a2f 0%, #1a3a5a 60%, #ff8c00 130%)",
    pattern: "rays" as const,
  },
  {
    kind: "MYTHOLOGY",
    hook: "The Norse god nobody talks about. And what he actually did.",
    handle: "@oldgods",
    tag: "#mythology",
    views: "672K",
    bg: "linear-gradient(165deg, #1a1410 0%, #3a2818 60%, #ffd700 130%)",
    pattern: "rune" as const,
  },
  {
    kind: "DATING",
    hook: "He texted at 2am. What she replied ended the relationship.",
    handle: "@lovedrama",
    tag: "#relationships",
    views: "3.3M",
    bg: "linear-gradient(165deg, #2a0f2a 0%, #4a1e4a 60%, #ff4580 130%)",
    pattern: "blob" as const,
  },
];

type PatternKind = "dots" | "scan" | "grid" | "rays" | "rune" | "blob";

function WaveformBars({ count = 14, active = true }: { count?: number; active?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", height: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 2,
            background: "#fff",
            borderRadius: 1,
            animation: active ? `wf 0.9s ease-in-out ${i * 0.06}s infinite alternate` : "none",
            height: 4 + ((i * 37) % 10),
          }}
        />
      ))}
    </div>
  );
}

function PhonePattern({ kind }: { kind: PatternKind }) {
  if (kind === "dots")
    return (
      <svg style={{ position: "absolute", inset: 0, opacity: 0.12 }} width="100%" height="100%">
        <defs>
          <pattern id="pd" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pd)" />
      </svg>
    );
  if (kind === "scan")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.04) 2px 3px)",
          pointerEvents: "none",
        }}
      />
    );
  if (kind === "grid")
    return (
      <svg style={{ position: "absolute", inset: 0, opacity: 0.1 }} width="100%" height="100%">
        <defs>
          <pattern id="pg" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0H0V14" stroke="#fff" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pg)" />
      </svg>
    );
  if (kind === "rays")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "conic-gradient(from 180deg at 50% 100%, transparent 0deg, rgba(255,255,255,0.08) 30deg, transparent 60deg, rgba(255,255,255,0.06) 90deg, transparent 120deg)",
          opacity: 0.6,
        }}
      />
    );
  if (kind === "rune")
    return (
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.15 }}
        width="100%"
        height="100%"
        viewBox="0 0 100 180"
        preserveAspectRatio="none"
      >
        <g stroke="#fff" strokeWidth="0.3" fill="none">
          <path d="M20 30L30 40L20 50M70 20L80 30L70 40M30 80L40 70M15 120L25 130M70 110L80 120L70 130" />
        </g>
      </svg>
    );
  if (kind === "blob")
    return (
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15), transparent 40%), radial-gradient(circle at 70% 70%, rgba(255,70,120,0.3), transparent 45%)",
          filter: "blur(12px)",
        }}
      />
    );
  return null;
}

export function PhoneMock({
  variant = "a",
  storyIdx = 0,
  playing = true,
  showProgress = true,
  thumbnail,
}: {
  variant?: "a" | "b" | "c";
  storyIdx?: number;
  playing?: boolean;
  showProgress?: boolean;
  thumbnail?: string;
}) {
  const story = STORIES[storyIdx % STORIES.length];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = ((t - start) / 8000) % 1;
      setProgress(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const times = ["9:41", "10:07", "11:23", "2:14", "8:56", "4:32"];

  return (
    <div className={`phone-frame phone-${variant}`}>
      <div
        className="phone-screen"
        style={{ background: thumbnail ? "#000" : story.bg }}
      >
        {thumbnail ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)",
                zIndex: 1,
              }}
            />
          </>
        ) : (
          <>
            <PhonePattern kind={story.pattern} />
            <div
              className="ken-burns"
              style={{
                position: "absolute",
                inset: "-8%",
                background:
                  "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(0,0,0,0.35), transparent 60%)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
        {/* Top status bar */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 18px",
            fontSize: 9,
            color: "#fff",
            fontFamily: "var(--font-mono)",
            opacity: 0.9,
            zIndex: 3,
          }}
        >
          <span>{times[storyIdx % 6]}</span>
          <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <span>5G</span>
            <span>◼◼◼◻</span>
          </span>
        </div>
        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "32px 14px 52px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#fff",
            zIndex: 2,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "0.25em",
                padding: "3px 7px",
                background: "rgba(255,69,0,0.25)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 3,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--fire)",
                  boxShadow: "0 0 6px var(--fire)",
                }}
              />
              {story.kind}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                marginTop: 10,
                lineHeight: 1.22,
                textShadow: "0 2px 6px rgba(0,0,0,0.7)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {story.hook}
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 9, opacity: 0.85 }}>
              <WaveformBars active={playing} />
              <span style={{ fontFamily: "var(--font-mono)" }}>{playing ? "0:04" : "0:00"}/0:42</span>
            </div>
          </div>
          {/* Right action rail */}
          <div
            style={{
              position: "absolute",
              right: 8,
              bottom: 56,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--fire),var(--ember))",
                border: "1.5px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
              }}
            >
              🜂
            </div>
            {[["♥", "124K"], ["💬", "8.2K"], ["↻", "3.1K"], ["↗", "Share"]].map(([ic, ct]) => (
              <div key={ic} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                  }}
                >
                  {ic}
                </div>
                <span style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>{ct}</span>
              </div>
            ))}
          </div>
          {/* Bottom handle */}
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", maxWidth: "70%" }}>
            <div style={{ fontWeight: 600 }}>{story.handle}</div>
            <div style={{ opacity: 0.75, marginTop: 2 }}>
              {story.tag} · {story.views} views
            </div>
          </div>
        </div>
        {/* Progress */}
        {showProgress && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 10,
              right: 10,
              height: 2,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 1,
              zIndex: 3,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: "#fff",
                borderRadius: 1,
                boxShadow: "0 0 4px rgba(255,255,255,0.6)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
