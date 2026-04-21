"use client";

import Link from "next/link";
import { GlitchHeadline } from "@/components/marketing/primitives/GlitchHeadline";
import { PhoneMock } from "@/components/marketing/primitives/PhoneMock";

export function HeroSection() {
  return (
    <section className="hero" style={{ textAlign: "center", paddingBottom: 0 }}>
      <div className="wrap-narrow">
        <div className="badge" style={{ marginTop: 16 }}>
          ⌁ SET IT AND FORGET IT
        </div>
        <div style={{ marginTop: 32 }}>
          <GlitchHeadline text="The faceless content engine for TikTok." />
        </div>
        <p className="text-2" style={{ fontSize: 20, maxWidth: 640, margin: "32px auto 0" }}>
          AI writes your scripts, renders your videos, posts to TikTok on autopilot. 66 content
          styles. Zero filming. You collect the views.
        </p>
        <div className="row gap-4 mt-8" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup?tier=free" className="btn btn-primary btn-lg">
            Start free — no card
          </Link>
          <Link href="/pricing" className="btn btn-ghost btn-lg">
            See paid tiers →
          </Link>
        </div>
        <div className="row gap-6 mt-8" style={{ justifyContent: "center", fontSize: 12, color: "var(--text-3)", flexWrap: "wrap" }}>
          <span>◆ 4 videos free, forever</span>
          <span>◆ No camera needed</span>
          <span>◆ Cancel anytime</span>
        </div>
      </div>
      <div className="phones-stage mt-16">
        <PhoneMock variant="a" storyIdx={0} />
        <PhoneMock variant="b" storyIdx={1} />
        <PhoneMock variant="c" storyIdx={2} />
      </div>
    </section>
  );
}
