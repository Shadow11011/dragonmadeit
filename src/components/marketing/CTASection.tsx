"use client";

import Link from "next/link";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { Sigil } from "@/components/marketing/primitives/Sigil";

export function CTASection() {
  return (
    <section className="sec-pad" style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
      <div className="wrap-narrow">
        <Reveal>
          <Sigil style={{ margin: "0 auto" }} />
          <h2 className="h1 mt-8">
            Your first AI video
            <br />
            <span style={{ color: "var(--fire)", fontStyle: "italic" }}>could be live tonight.</span>
          </h2>
          <p className="text-2 mt-6" style={{ fontSize: 17 }}>
            Pick a niche. The dragon handles the rest. Start free — no card required.
          </p>
          <div className="row gap-4 mt-8" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup?tier=free" className="btn btn-primary btn-lg">
              Start free — no card
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">
              See paid tiers →
            </Link>
          </div>
          <div
            className="mt-6 mono"
            style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--text-3)" }}
          >
            4 VIDEOS FREE / MONTH · NO CARD · CANCEL ANYTIME
          </div>
        </Reveal>
      </div>
    </section>
  );
}
