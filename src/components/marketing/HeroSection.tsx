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
          <Link href="/signup" className="btn btn-primary btn-lg">
            Launch my channel · $15/mo
          </Link>
          <a href="#how-it-works" className="btn btn-ghost btn-lg">
            See how it works ↓
          </a>
        </div>
        <div className="row gap-6 mt-8" style={{ justifyContent: "center", fontSize: 12, color: "var(--text-3)", flexWrap: "wrap" }}>
          <span>◆ Cancel anytime</span>
          <span>◆ No camera needed</span>
          <span>◆ No editing software</span>
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
