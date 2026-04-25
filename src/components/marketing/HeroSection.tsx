"use client";

import Link from "next/link";
import { PhoneMock } from "@/components/marketing/primitives/PhoneMock";

export function HeroSection() {
  return (
    <section className="hero" style={{ textAlign: "center", paddingBottom: 0 }}>
      <div className="wrap-narrow">
        <div className="badge" style={{ marginTop: 16 }}>
          Set it and leave
        </div>
        <h1 className="h-mega" style={{ marginTop: 32 }}>
          A content engine that runs itself.
        </h1>
        <p className="text-2" style={{ fontSize: 19, lineHeight: 1.6, maxWidth: 620, margin: "32px auto 0" }}>
          Generate faceless videos from scratch, repurpose your long-form content, or schedule
          what you already make. Posts to TikTok, Instagram Reels, and YouTube Shorts on the
          cadence you set. Configure once, then focus on everything else.
        </p>
        <div className="row gap-4 mt-8" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup?tier=free" className="btn btn-primary btn-lg">
            Start free, no card
          </Link>
        </div>
        <div
          className="row mt-8"
          style={{
            justifyContent: "center",
            fontSize: 12,
            color: "var(--text-3)",
            flexWrap: "wrap",
            gap: "8px 18px",
          }}
        >
          <span>Free forever</span>
          <span aria-hidden>·</span>
          <span>No card needed</span>
          <span aria-hidden>·</span>
          <span>Cancel anytime</span>
        </div>
      </div>
      <div className="phones-stage mt-16">
        <PhoneMock variant="a" storyIdx={0} thumbnail="/videos/proof/clip-1.jpg" />
        <PhoneMock variant="b" storyIdx={5} thumbnail="/videos/proof/gameplay.jpg" />
        <PhoneMock variant="c" storyIdx={2} thumbnail="/videos/proof/clip-2.jpg" />
      </div>
    </section>
  );
}
