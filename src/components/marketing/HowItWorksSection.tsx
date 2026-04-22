"use client";

import { Fragment, useEffect, useState } from "react";
import { Reveal } from "@/components/marketing/primitives/Reveal";

const STEPS = [
  {
    n: "01",
    t: "Pick your niche",
    d: "Choose from 66 story styles. Reddit, horror, motivation, true crime. Set voice, pacing, length. Done in 60 seconds.",
  },
  {
    n: "02",
    t: "The dragon forges",
    d: "Scripts, visuals, voiceover, editing. Full TikTok videos assembled without a camera, mic, or editor software.",
  },
  {
    n: "03",
    t: "Watch it grow",
    d: "Videos post on schedule automatically. Track views and engagement while you sleep. Keep what works, kill what doesn't.",
  },
];

const NODES = ["SCRIPT", "IMAGES", "VOICE", "ASSEMBLE", "POST"];

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setActive((a) => (a + 1) % NODES.length), 1400);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="sec-pad" id="how-it-works" style={{ position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">HOW IT WORKS</div>
        </Reveal>
        <Reveal>
          <h2 className="h1">
            From zero to posting
            <br />
            <span style={{ color: "var(--fire)", fontStyle: "italic" }}>in under two minutes.</span>
          </h2>
        </Reveal>

        <div
          className="mt-16 steps-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}
        >
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--fire)", letterSpacing: "0.3em" }}
                >
                  {s.n}
                </div>
                <div className="h2 mt-4">{s.t}</div>
                <p className="text-2 mt-4" style={{ fontSize: 14 }}>
                  {s.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <div className="mt-16 terminal">
            <div className="terminal-head">
              <div className="term-dot" style={{ background: "#ff5f57" }} />
              <div className="term-dot" style={{ background: "#febc2e" }} />
              <div className="term-dot" style={{ background: "#28c840" }} />
              <span
                className="mono"
                style={{ marginLeft: 12, color: "var(--text-3)", fontSize: 11 }}
              >
                dragonmadeit.app/dashboard
              </span>
            </div>
            <div className="pipe" style={{ padding: 40 }}>
              {NODES.map((n, i) => (
                <Fragment key={n}>
                  <div className={"pipe-node" + (i <= active ? " live" : "")}>
                    <div
                      className="mono"
                      style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--fire)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-2" style={{ fontSize: 13, fontWeight: 600 }}>
                      {n}
                    </div>
                  </div>
                  {i < NODES.length - 1 && <div className="pipe-arrow">→</div>}
                </Fragment>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <style jsx>{`
        @media (max-width: 760px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
