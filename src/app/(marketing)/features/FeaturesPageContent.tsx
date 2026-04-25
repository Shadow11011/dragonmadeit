"use client";

import { Reveal } from "@/components/marketing/primitives/Reveal";
import { PILLARS } from "@/components/marketing/FeaturesSection";

const FEATURES = PILLARS.map((p) => ({ n: p.n, t: p.t, d: p.outcome }));

const DEEP_FEATURES = [
  {
    t: "Generate",
    d: "Faceless AI videos, built from a niche and a cadence. Scripts, voice, visuals, and cuts happen without you touching a timeline.",
    sub: [
      "66 niche story patterns, pre-curated",
      "Flux-generated visuals or gameplay overlays",
      "Edge TTS and Kokoro TTS narration",
      "FFmpeg assembly at render time",
      "Auto-posts across TikTok, Instagram Reels, and YouTube Shorts",
    ],
  },
  {
    t: "Repurpose",
    d: "Drop a YouTube URL or podcast feed. The platform transcribes, finds the moments worth clipping, and ships them as shorts.",
    sub: [
      "Groq Whisper transcription at 200x realtime",
      "AI picks the highlights by default",
      "Guided mode: describe what to extract in plain text",
      "Parallel FFmpeg cuts, usually in under five minutes",
      "Coming soon",
    ],
  },
  {
    t: "Schedule",
    d: "Already making your own shorts? Bring your own content. The platform handles queueing and cross-platform posting.",
    sub: [
      "Monthly calendar view across every connected account",
      "Drag to reschedule, or keep it hands-off",
      "Bulk upload via CSV",
      "Timezone-aware posting windows",
      "One upload, posts to any combination of the three platforms",
    ],
  },
];

export function FeaturesPageContent() {
  return (
    <>
      <section className="sec-pad" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="eyebrow">FEATURES</div>
          <h1 className="h-display mt-6">
            One engine. Three paths.
          </h1>
          <p className="text-2 mt-6" style={{ fontSize: 18, maxWidth: 620, margin: "24px auto 0" }}>
            Generate faceless videos, repurpose long-form content, or schedule what you already make. Posts to TikTok, Instagram Reels, and YouTube Shorts.
          </p>
        </div>
      </section>

      <section className="sec-pad-sm">
        <div className="wrap">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} delay={i * 60}>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.3em" }}
                >
                  {f.n}
                </div>
                <div className="h3 mt-4">{f.t}</div>
                <p className="text-2 mt-4" style={{ fontSize: 14, lineHeight: 1.65 }}>
                  {f.d}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {DEEP_FEATURES.map((f, i) => (
        <section key={f.t} className="sec-pad">
          <div className="wrap">
            <div
              className="deep-grid"
              style={{
                display: "grid",
                gridTemplateColumns: i % 2 === 1 ? "1fr 1.1fr" : "1.1fr 1fr",
                gap: 64,
                alignItems: "center",
              }}
            >
              <div style={{ order: i % 2 === 1 ? 2 : 0 }}>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.3em" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="h1 mt-4">{f.t}</h2>
                <p className="text-2 mt-6" style={{ fontSize: 16 }}>
                  {f.d}
                </p>
                <ul className="stack gap-3 mt-8">
                  {f.sub.map((s) => (
                    <li key={s} className="row gap-3" style={{ fontSize: 14 }}>
                      <span style={{ color: "var(--accent)" }}>◆</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                style={{
                  aspectRatio: "4/3",
                  border: "1px solid var(--border)",
                  borderRadius: "calc(var(--radius-base) * 2)",
                  background: "var(--bg-1)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                  <defs>
                    <pattern id={`p${i}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0 20 L20 0" stroke="var(--border)" strokeWidth="1" opacity="0.4" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#p${i})`} />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: 12, letterSpacing: "0.2em" }}
                  >
                    [ {f.t.toUpperCase()} VISUAL ]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <style jsx>{`
        @media (max-width: 760px) {
          .deep-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </>
  );
}
