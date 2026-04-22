"use client";

import { Reveal } from "@/components/marketing/primitives/Reveal";

export const FEATURES = [
  {
    t: "66 viral niches",
    d: "Reddit, true crime, horror, motivation, dating drama. Our AI writes scripts that hook viewers in the first 3 seconds.",
    n: "01",
  },
  {
    t: "Studio-quality video",
    d: "AI-generated visuals, pro voiceover, polished editing. Full TikToks without a camera, mic, or software.",
    n: "02",
  },
  {
    t: "Script to screen",
    d: "Script, voice, visuals, cut, post. The entire pipeline runs without you lifting a finger.",
    n: "03",
  },
  {
    t: "Post every day (or twice)",
    d: "3×, 7×, or 14× per week. The algorithm rewards consistency. Your dragon never misses a scheduled post.",
    n: "04",
  },
  {
    t: "See what's working",
    d: "Track views, likes, shares, engagement. Know which niches and styles perform so you double down.",
    n: "05",
  },
  {
    t: "No face. No filming.",
    d: "Join the faceless wave. Your audience cares about content, not your camera.",
    n: "06",
  },
];

export function FeaturesSection() {
  return (
    <section className="sec-pad" style={{ background: "var(--bg-1)", position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">WHAT YOU GET</div>
        </Reveal>
        <div
          className="intro-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}
        >
          <Reveal>
            <h2 className="h1">
              Your entire content team,
              <br />
              <span style={{ color: "var(--ember)", fontStyle: "italic" }}>
                bound to one sigil.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-2" style={{ fontSize: 16 }}>
              Writer. Voice actor. Video editor. Posting manager. Analyst. Replaced by one dragon
              that doesn&apos;t sleep, complain, or miss a deadline.
            </p>
          </Reveal>
        </div>
        <div className="features-grid mt-16">
          {FEATURES.map((f, i) => (
            <Reveal key={f.t} delay={i * 80}>
              <div
                className="mono"
                style={{ fontSize: 11, color: "var(--fire)", letterSpacing: "0.3em" }}
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
      <style jsx>{`
        @media (max-width: 760px) {
          .intro-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
