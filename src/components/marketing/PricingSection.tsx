"use client";

import Link from "next/link";
import { Reveal } from "@/components/marketing/primitives/Reveal";

export function PricingSection() {
  return (
    <section className="sec-pad" style={{ background: "var(--bg-1)", position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">CH.05 · CHOOSE YOUR KIN</div>
        </Reveal>
        <div
          className="teaser-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end" }}
        >
          <Reveal>
            <h2 className="h1">
              Three dragons.
              <br />
              Three appetites.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-2" style={{ fontSize: 16, maxWidth: 440 }}>
              From Hatchling to Elder. Every plan includes full AI pipeline + 1 TikTok account. Only
              the posting cadence scales.
            </p>
          </Reveal>
        </div>
        <div className="mt-12" style={{ textAlign: "center" }}>
          <Link href="/pricing" className="btn btn-primary btn-lg">
            See full pricing →
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
