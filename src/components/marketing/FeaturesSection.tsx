"use client";

import { Reveal } from "@/components/marketing/primitives/Reveal";

type Pillar = {
  n: string;
  t: string;
  outcome: string;
  bullets: string[];
  status?: "shipping" | "coming-soon";
};

export const PILLARS: Pillar[] = [
  {
    n: "01",
    t: "Generate",
    outcome:
      "We write, voice, and render faceless videos from scratch, then post them on the cadence you set.",
    bullets: [
      "66 niches and story formats, from Reddit to true crime to motivation",
      "AI script, AI voiceover, AI visuals, assembled end-to-end",
      "Posted automatically on your schedule",
    ],
    status: "shipping",
  },
  {
    n: "02",
    t: "Repurpose",
    outcome:
      "Drop a YouTube or podcast URL. The platform finds the moments worth clipping and ships them as shorts.",
    bullets: [
      "Paste a long-form link, pick a clip count",
      "Captions and vertical reframing handled",
      "Queued into the same posting schedule as everything else",
    ],
    status: "coming-soon",
  },
  {
    n: "03",
    t: "Schedule",
    outcome:
      "Already making your own shorts? Bring your own content and let the platform handle posting.",
    bullets: [
      "Bring your vertical videos, we queue them up",
      "Pick cadence per account, set and leave",
      "One schedule across every connected platform",
    ],
    status: "shipping",
  },
];

export function FeaturesSection() {
  return (
    <section className="sec-pad" style={{ background: "var(--bg-1)", position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">THREE PATHS, ONE ENGINE</div>
        </Reveal>
        <div
          className="intro-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}
        >
          <Reveal>
            <h2 className="h1">
              Pick your path.
              <br />
              <span style={{ color: "var(--ember)", fontStyle: "italic" }}>
                Set it and leave.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-2" style={{ fontSize: 16 }}>
              Whether you have no content, long-form content you want clipped, or shorts you
              already make, DragonMadeIt takes it from there. Posts land on TikTok, Instagram
              Reels, and YouTube Shorts on the schedule you set.
            </p>
          </Reveal>
        </div>
        <div className="features-grid mt-16">
          {PILLARS.map((p, i) => (
            <Reveal key={p.t} delay={i * 80}>
              <div
                className="row"
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--fire)", letterSpacing: "0.3em" }}
                >
                  {p.n}
                </div>
                {p.status === "coming-soon" && (
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      color: "var(--text-3)",
                      border: "1px solid var(--border)",
                      borderRadius: 999,
                      padding: "4px 10px",
                    }}
                  >
                    COMING SOON
                  </span>
                )}
              </div>
              <div className="h3 mt-4">{p.t}</div>
              <p className="text-2 mt-4" style={{ fontSize: 14, lineHeight: 1.65 }}>
                {p.outcome}
              </p>
              <ul
                className="mt-6"
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="text-2"
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      paddingLeft: 18,
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        color: "var(--fire)",
                      }}
                    >
                      ◆
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
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
