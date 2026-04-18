"use client";

import { Reveal } from "@/components/marketing/primitives/Reveal";

const TESTIMONIALS = [
  {
    q: "Set it up on a Sunday, by Wednesday I had 3 videos posted automatically. This thing just works.",
    n: "Alex R.",
    h: "@faceless_reads",
    niche: "Reddit Stories",
    views: "340K",
  },
  {
    q: "I was paying $400/month for a freelance editor. Now I pay $39 and post every day. No-brainer.",
    n: "Jordan M.",
    h: "@crimechannel",
    niche: "True Crime",
    views: "1.2M",
  },
  {
    q: "67K views in my first month. Never showed my face once. The AI picks content that actually goes viral.",
    n: "Sam K.",
    h: "@darknarrations",
    niche: "Horror",
    views: "67K",
  },
];

export function Testimonials() {
  return (
    <section className="sec-pad" style={{ position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">CH.04 · THE SCRIBES SPEAK</div>
        </Reveal>
        <div className="stack gap-12 mt-12">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.n} delay={i * 100}>
              <blockquote style={{ paddingLeft: i % 2 === 1 ? 80 : 0, maxWidth: 820 }}>
                <p
                  className="h2"
                  style={{ fontStyle: "italic", textWrap: "pretty", fontWeight: 400 }}
                >
                  &ldquo;{t.q}&rdquo;
                </p>
                <footer
                  className="row gap-6 mt-6"
                  style={{ fontSize: 13, color: "var(--text-2)", flexWrap: "wrap" }}
                >
                  <span>{t.n}</span>
                  <span style={{ color: "var(--fire)" }}>{t.h}</span>
                  <span>· {t.niche}</span>
                  <span className="mono" style={{ color: "var(--gold)" }}>
                    ▶ {t.views}
                  </span>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
