"use client";

import Link from "next/link";
import { Reveal } from "@/components/marketing/primitives/Reveal";

export function PricingSection() {
  return (
    <section className="sec-pad" style={{ background: "var(--bg-1)", position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">PRICING</div>
        </Reveal>
        <div
          className="teaser-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end" }}
        >
          <Reveal>
            <h2 className="h1">
              Free to start.
              <br />
              Paid to scale.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-2" style={{ fontSize: 16, maxWidth: 440 }}>
              Sample every pillar free, no card. Upgrade to one pillar at $12–$19/month, or
              bundle all three from $45.
            </p>
          </Reveal>
        </div>
        <div className="row gap-4 mt-12" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup?tier=free" className="btn btn-primary btn-lg">
            Start free, no card
          </Link>
          <Link href="/pricing" className="btn btn-ghost btn-lg">
            See full pricing
          </Link>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 760px) {
          .teaser-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
