"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PricingTierCard,
  TIERS,
  type Interval,
} from "@/components/marketing/PricingTierCard";

const INTERVALS: { value: Interval; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly · 15% off" },
  { value: "ANNUAL", label: "Annual · 30% off" },
];

const FAQS: [string, string][] = [
  [
    "What are the three modes?",
    "Generate creates AI videos from scratch (gameplay or AI-image). Clipper turns your long-form content into short clips. Scheduler publishes your own pre-made content on a set cadence. Each paid tier picks one or bundles all three.",
  ],
  [
    "What's in the free tier?",
    "A sample of every mode so you can see the output before you pay: 4 AI-generated videos, 4 clips, and 4 scheduled uploads per month. Videos include a small \"dragonmadeit.app\" watermark on the generated output. No credit card required.",
  ],
  [
    "How do Creator, Clipper, and Scheduler compare?",
    "Creator is generate-only: 20 AI videos per month at $19. Clipper is clip-only: 20 clips per month at $19. Scheduler is the schedule-only tier for teams that already have content: 100 uploads per month at $12. Pick the mode that matches the work you actually want to offload.",
  ],
  [
    "When should I pick Studio over a single-mode tier?",
    "Studio at $45 bundles all three modes (40 generate, 40 clips, 250 scheduled uploads) and 5 linked accounts. If you'd otherwise buy two of the $19 tiers, Studio is the better deal and gives you the third mode for free. Studio Pro ($79) bumps the volume for business use.",
  ],
  [
    "Can I switch plans later?",
    "Yes. Upgrade or downgrade anytime. Upgrades prorate; downgrades take effect at the end of the current billing cycle. Free users can upgrade to remove the watermark and unlock the full pillar quotas.",
  ],
  [
    "Do you offer discounts for longer commitments?",
    "Yes. 15% off on quarterly billing, 30% off on annual billing. Same on every paid tier.",
  ],
  [
    "Can I cancel anytime?",
    "Yes. No contracts. Cancel from the dashboard and keep access through the end of your billing period.",
  ],
  [
    "Will my TikTok account get banned?",
    "No. We post through the official TikTok API. No bots, no scrapers. Fully TOS-compliant.",
  ],
  [
    "What's Agency?",
    "Custom-volume plan for agencies running 30+ accounts or needing more headroom than Studio Pro. Billed per contract, not self-serve. Email us to talk volume.",
  ],
];

export function PricingPageContent() {
  const [interval, setInterval] = useState<Interval>("MONTHLY");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <section className="sec-pad" style={{ textAlign: "center", paddingBottom: 40 }}>
        <div className="wrap">
          <div className="eyebrow">PRICING</div>
          <h1 className="h-display mt-6">
            One mode or all three.
            <br />
            Your call.
          </h1>
          <p className="text-2 mt-6" style={{ fontSize: 18 }}>
            Generate, Clip, or Schedule. Pick the mode that matches the work you want to offload.
          </p>
          <div
            className="mt-12"
            style={{
              display: "inline-flex",
              background: "var(--bg-1)",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius-base) * 2)",
              padding: 4,
              flexWrap: "wrap",
            }}
          >
            {INTERVALS.map((i) => (
              <button
                key={i.value}
                onClick={() => setInterval(i.value)}
                className="mono"
                style={{
                  padding: "10px 18px",
                  borderRadius: "var(--radius-base)",
                  background: interval === i.value ? "var(--accent)" : "transparent",
                  color: interval === i.value ? "#fff" : "var(--text-2)",
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-pad-sm">
        <div className="wrap">
          <div className="pricing-grid">
            {TIERS.map((t) => (
              <PricingTierCard key={t.key} tier={t} interval={interval} />
            ))}
          </div>
        </div>
      </section>

      <section className="sec-pad" style={{ background: "var(--bg-1)" }}>
        <div className="wrap-narrow">
          <div className="chapter-label">FAQ</div>
          <h2 className="h1 mt-4">Frequently asked questions</h2>
          <div className="mt-12">
            {FAQS.map(([q, a], i) => (
              <div key={q} className={"faq-item" + (openFaq === i ? " open" : "")}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{q}</span>
                  <span className="chev">▾</span>
                </button>
                <div className="faq-a">
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-pad" style={{ textAlign: "center" }}>
        <div className="wrap-narrow">
          <h2 className="h1">Ready to get started?</h2>
          <p className="text-2 mt-4">Sample every mode for free. No card needed.</p>
          <div className="row gap-4 mt-8" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup?tier=free" className="btn btn-primary btn-lg">
              Start free, no card
            </Link>
            <Link href="/signup" className="btn btn-ghost btn-lg">
              Pick a paid tier
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
