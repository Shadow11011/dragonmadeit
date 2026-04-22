"use client";

import { Reveal } from "@/components/marketing/primitives/Reveal";
import { Sigil } from "@/components/marketing/primitives/Sigil";

const PAINS = [
  "10+ hrs/week filming",
  "Inconsistency kills reach",
  "Algorithm punishes gaps",
  "$500 to $2K/mo on editors",
  "Creator burnout",
];

const WINS = [
  "0 hours · fully automated",
  "Daily posts on autopilot",
  "Algorithm rewards consistency",
  "Starts at $15/mo",
  "Set once · forge forever",
];

export function ChapterProblem() {
  return (
    <section className="sec-pad" style={{ position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">THE PROBLEM</div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 64 }} className="problem-grid">
          <Reveal>
            <h2 className="h1">
              Every week you don&apos;t automate, the algorithm forgets your name.
            </h2>
            <ul className="stack gap-3 mt-8" style={{ fontSize: 16 }}>
              {PAINS.map((p) => (
                <li key={p} className="row gap-3 text-2">
                  <span style={{ color: "oklch(0.6 0.2 25)", fontFamily: "var(--font-mono)" }}>
                    ✗
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <div
              className="card"
              style={{
                background: "oklch(from var(--fire) l c h / 0.06)",
                borderColor: "oklch(from var(--fire) l c h / 0.3)",
              }}
            >
              <div className="row gap-3">
                <Sigil size="sm" />
                <div className="h3" style={{ color: "var(--fire)" }}>
                  With DragonMadeIt
                </div>
              </div>
              <ul className="stack gap-3 mt-6">
                {WINS.map((w) => (
                  <li key={w} className="row gap-3" style={{ fontSize: 14 }}>
                    <span style={{ color: "var(--fire)", fontFamily: "var(--font-mono)" }}>✓</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 760px) {
          .problem-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
