"use client";

import Link from "next/link";
import { GlitchHeadline } from "@/components/marketing/primitives/GlitchHeadline";
import { PhoneMock } from "@/components/marketing/primitives/PhoneMock";

export function HeroSection() {
  return (
    <section className="hero" style={{ textAlign: "center", paddingBottom: 0 }}>
      <div className="wrap-narrow">
        <div className="badge" style={{ marginTop: 16 }}>
          ⌁ SET IT AND LEAVE
        </div>
        <div style={{ marginTop: 32 }}>
          <GlitchHeadline text="A content engine that runs itself." />
        </div>
        <p className="text-2" style={{ fontSize: 20, maxWidth: 640, margin: "32px auto 0" }}>
          Generate faceless videos from scratch, repurpose your long-form content, or schedule
          what you already make. Posts to TikTok, Instagram Reels, and YouTube Shorts on the
          cadence you set. Configure once, then focus on everything else.
        </p>
        <div className="row gap-4 mt-8" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup?tier=free" className="btn btn-primary btn-lg">
            Start free, no card
          </Link>
        </div>
        <div className="row gap-6 mt-8" style={{ justifyContent: "center", fontSize: 12, color: "var(--text-3)", flexWrap: "wrap" }}>
          <span>◆ 4 videos free, forever</span>
          <span>◆ No camera needed</span>
          <span>◆ Cancel anytime</span>
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
