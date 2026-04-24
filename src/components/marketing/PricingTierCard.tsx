"use client";

import Link from "next/link";
import { Sigil } from "@/components/marketing/primitives/Sigil";

export type Interval = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export interface TierSpec {
  key: "FREE" | "HATCHLING" | "DRAKE" | "ELDER_DRAGON";
  name: string;
  color: string;
  price: number;
  videos: number;
  popular: boolean;
  desc: string;
  features: string[];
  /** per-month video quota (defaults to videos × 4 weeks for paid tiers) */
  monthlyCap?: number;
}

export const TIERS: TierSpec[] = [
  {
    key: "FREE",
    name: "Free",
    color: "#71717a",
    price: 0,
    videos: 1,
    monthlyCap: 4,
    popular: false,
    desc: "Try the engine, no card. See the output before you pay.",
    features: [
      "1 video per week · 4/month",
      "Gameplay content only",
      "Watermark on video + end card",
      "Auto-posted to TikTok",
      "AI-image niches locked",
      "No credit card required",
    ],
  },
  {
    key: "HATCHLING",
    name: "Hatchling",
    color: "#c87533",
    price: 15,
    videos: 3,
    popular: false,
    desc: "For the first-time forger. Start the fire.",
    features: [
      "3 videos per week",
      "1 TikTok account",
      "66 content styles",
      "AI scripts + voiceover",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    key: "DRAKE",
    name: "Drake",
    color: "#ff8c00",
    price: 39,
    videos: 7,
    popular: true,
    desc: "Daily fire. The algorithm's favorite.",
    features: [
      "7 videos per week (daily)",
      "1 TikTok account",
      "66 content styles",
      "AI scripts + voiceover",
      "Advanced analytics",
      "Content scheduling",
    ],
  },
  {
    key: "ELDER_DRAGON",
    name: "Elder Dragon",
    color: "#ffd700",
    price: 129,
    videos: 14,
    popular: false,
    desc: "Twice-daily dominance. Scorched-earth growth.",
    features: [
      "14 videos per week (2×/day)",
      "1 TikTok account",
      "66 content styles",
      "AI scripts + voiceover",
      "Advanced analytics",
      "Content scheduling",
    ],
  },
];

const CTA_COPY: Record<TierSpec["key"], string> = {
  FREE: "Start free — no card",
  HATCHLING: "Hatch my channel",
  DRAKE: "Go daily with Drake",
  ELDER_DRAGON: "Unleash the Elder",
};

export function PricingTierCard({ tier, interval }: { tier: TierSpec; interval: Interval }) {
  const isFree = tier.key === "FREE";
  const mult = isFree ? 1 : { MONTHLY: 1, QUARTERLY: 0.85, ANNUAL: 0.7 }[interval];
  const monthly = Math.round(tier.price * mult);
  const monthlyVideos = tier.monthlyCap ?? tier.videos * 4;
  const perVid = isFree ? "0.00" : (monthly / monthlyVideos).toFixed(2);
  const billedLabel =
    isFree || interval === "MONTHLY"
      ? ""
      : interval === "QUARTERLY"
        ? `billed $${Math.round(tier.price * mult * 3)}/qtr`
        : `billed $${Math.round(tier.price * mult * 12)}/yr`;

  return (
    <div
      className="card"
      style={{
        borderTop: `3px solid ${tier.color}`,
        transform: tier.popular ? "translateY(-8px)" : "none",
        boxShadow: tier.popular ? `0 30px 80px -30px ${tier.color}55` : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {tier.popular && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: tier.color,
            color: "#0a0a0f",
            padding: "4px 14px",
            borderRadius: 999,
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.2em",
            fontWeight: 700,
          }}
        >
          MOST POPULAR
        </div>
      )}
      <div className="row gap-3">
        <Sigil
          size="sm"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${tier.color}, ${tier.color}aa 50%, ${tier.color}44 100%)`,
          }}
        />
        <h3 className="h3" style={{ color: tier.color, fontStyle: "italic" }}>
          {tier.name}
        </h3>
      </div>
      <div className="mt-6" style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        {interval !== "MONTHLY" && (
          <span className="text-3" style={{ textDecoration: "line-through", fontSize: 16 }}>
            ${tier.price}
          </span>
        )}
        <span className="h-display" style={{ fontSize: "3rem" }}>
          ${monthly}
        </span>
        <span className="text-2" style={{ fontSize: 14 }}>
          /mo
        </span>
      </div>
      <div className="mono mt-2" style={{ fontSize: 11, color: "var(--text-3)" }}>
        {isFree ? (
          <>Forever free · {monthlyVideos} videos/mo</>
        ) : (
          <>
            ${perVid}/video · {monthlyVideos} videos/mo
            {billedLabel && <> · {billedLabel}</>}
          </>
        )}
      </div>
      <p className="text-2 mt-4" style={{ fontSize: 14 }}>
        {tier.desc}
      </p>
      <ul className="stack gap-3 mt-6" style={{ flex: 1 }}>
        {tier.features.map((f) => (
          <li key={f} className="row gap-3" style={{ fontSize: 13 }}>
            <span style={{ color: tier.color, fontFamily: "var(--font-mono)" }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={isFree ? "/signup?tier=free" : "/signup"}
        className="btn btn-lg mt-8"
        style={{ background: tier.color, color: "#0a0a0f", fontWeight: 700 }}
      >
        {CTA_COPY[tier.key]}
      </Link>
      <div
        className="mono mt-4"
        style={{
          fontSize: 10,
          color: "var(--text-3)",
          textAlign: "center",
          letterSpacing: "0.2em",
        }}
      >
        {isFree ? "NO CARD REQUIRED" : "CANCEL ANYTIME"}
      </div>
    </div>
  );
}
