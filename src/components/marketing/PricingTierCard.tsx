"use client";

import Link from "next/link";
import { Sigil } from "@/components/marketing/primitives/Sigil";

export type Interval = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export type TierKey =
  | "FREE"
  | "SCHEDULER"
  | "CREATOR"
  | "CLIPPER"
  | "STUDIO"
  | "STUDIO_PRO"
  | "AGENCY";

export interface TierSpec {
  key: TierKey;
  name: string;
  color: string;
  /** Monthly USD price. null for AGENCY (custom). */
  price: number | null;
  popular: boolean;
  desc: string;
  features: string[];
  /** True for AGENCY: render "Contact us" CTA, hide billing-interval math. */
  custom?: boolean;
}

export const TIERS: TierSpec[] = [
  {
    key: "FREE",
    name: "Free",
    color: "#71717a",
    price: 0,
    popular: false,
    desc: "Try every mode free. Watermarked output, no card required.",
    features: [
      "4 AI-generated videos per month (watermarked)",
      "4 clips per month (watermarked)",
      "4 scheduled uploads per month",
      "1 linked social account",
      "No credit card required",
    ],
  },
  {
    key: "SCHEDULER",
    name: "Scheduler",
    color: "#4fb0c6",
    price: 12,
    popular: false,
    desc: "Bring your own content. Schedule and publish on autopilot.",
    features: [
      "100 scheduled uploads per month",
      "2 linked social accounts",
      "Bulk CSV upload",
      "Monthly calendar view",
      "Basic analytics",
    ],
  },
  {
    key: "CREATOR",
    name: "Creator",
    color: "#c87533",
    price: 19,
    popular: false,
    desc: "Fully automated AI video generation. Posted for you.",
    features: [
      "20 AI-generated videos per month",
      "2 linked social accounts",
      "All 66 content niches",
      "AI scripts and voiceover",
      "Basic analytics",
    ],
  },
  {
    key: "CLIPPER",
    name: "Clipper",
    color: "#ff8c00",
    price: 19,
    popular: false,
    desc: "Turn long-form content into short clips, automatically.",
    features: [
      "20 clips per month",
      "2 linked social accounts",
      "Auto-detected viral moments",
      "Vertical reformat for TikTok and Shorts",
      "Basic analytics",
    ],
  },
  {
    key: "STUDIO",
    name: "Studio",
    color: "#ff6a00",
    price: 45,
    popular: true,
    desc: "All three pillars. Generate, clip, and schedule from one place.",
    features: [
      "40 AI-generated videos per month",
      "40 clips per month",
      "250 scheduled uploads per month",
      "5 linked social accounts",
      "Full analytics dashboard",
      "Bulk CSV upload",
    ],
  },
  {
    key: "STUDIO_PRO",
    name: "Studio Pro",
    color: "#ffd700",
    price: 79,
    popular: false,
    desc: "Business volume across every pillar.",
    features: [
      "100 AI-generated videos per month",
      "100 clips per month",
      "700 scheduled uploads per month",
      "10 linked social accounts",
      "Full analytics dashboard",
      "Bulk CSV upload",
      "Priority support",
    ],
  },
  {
    key: "AGENCY",
    name: "Agency",
    color: "#ffd700",
    price: null,
    popular: false,
    custom: true,
    desc: "Custom volume and 30+ accounts. Talk to us.",
    features: [
      "Custom AI generation volume",
      "Custom clip volume",
      "Custom scheduling volume",
      "30+ linked social accounts",
      "Dedicated onboarding",
      "Priority support",
    ],
  },
];

const CTA_COPY: Record<TierKey, string> = {
  FREE: "Start free, no card",
  SCHEDULER: "Schedule on autopilot",
  CREATOR: "Generate on autopilot",
  CLIPPER: "Start clipping",
  STUDIO: "Get the full studio",
  STUDIO_PRO: "Scale with Studio Pro",
  AGENCY: "Contact us",
};

export function PricingTierCard({ tier, interval }: { tier: TierSpec; interval: Interval }) {
  const isFree = tier.key === "FREE";
  const isCustom = tier.custom === true;
  const basePrice = tier.price ?? 0;
  const mult = isFree || isCustom ? 1 : { MONTHLY: 1, QUARTERLY: 0.85, ANNUAL: 0.7 }[interval];
  const monthly = Math.round(basePrice * mult);
  const billedLabel =
    isFree || isCustom || interval === "MONTHLY"
      ? ""
      : interval === "QUARTERLY"
        ? `billed $${Math.round(basePrice * mult * 3)}/qtr`
        : `billed $${Math.round(basePrice * mult * 12)}/yr`;
  const href = isCustom
    ? "mailto:adonanthony5@gmail.com?subject=DragonMadeIt%20Agency%20enquiry"
    : isFree
      ? "/signup?tier=free"
      : `/signup?tier=${tier.key.toLowerCase()}`;

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
        <Sigil size="sm" />
        <h3 className="h3" style={{ color: tier.color }}>
          {tier.name}
        </h3>
      </div>
      <div className="mt-6" style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        {!isFree && !isCustom && interval !== "MONTHLY" && (
          <span className="text-3" style={{ textDecoration: "line-through", fontSize: 16 }}>
            ${basePrice}
          </span>
        )}
        {isCustom ? (
          <span className="h-display" style={{ fontSize: "2.4rem" }}>
            Custom
          </span>
        ) : (
          <>
            <span className="h-display" style={{ fontSize: "3rem" }}>
              ${monthly}
            </span>
            <span className="text-2" style={{ fontSize: 14 }}>
              /mo
            </span>
          </>
        )}
      </div>
      <div className="mono mt-2" style={{ fontSize: 11, color: "var(--text-3)" }}>
        {isFree ? (
          <>Forever free</>
        ) : isCustom ? (
          <>Priced to your volume</>
        ) : billedLabel ? (
          <>{billedLabel}</>
        ) : (
          <>Billed monthly</>
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
        href={href}
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
        {isFree ? "NO CARD REQUIRED" : isCustom ? "CUSTOM CONTRACT" : "CANCEL ANYTIME"}
      </div>
    </div>
  );
}
