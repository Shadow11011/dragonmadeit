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

const COMPARE_ROWS: [string, string, string, string][] = [
  ["Free tier with posting", "✓ (4/mo)", "–", "–"],
  ["Starting price (paid)", "$15/mo", "$19/mo", "$29/mo"],
  ["Creates videos", "✓", "✓", "✓"],
  ["Posts to TikTok", "✓", "✓", "–"],
  ["Content styles", "66", "Limited", "Limited"],
  ["Full automation", "✓", "Partial", "–"],
  ["Custom voices", "✓", "✓", "–"],
  ["Cancel anytime", "✓", "✓", "–"],
];

const FAQS: [string, string][] = [
  [
    "What's in the free tier?",
    "4 videos per month (1 per week), gameplay-only content, auto-posted to your TikTok. Videos include a small \"dragonmadeit.app\" watermark and a 2-second end card. No credit card required. AI-image niches stay locked until you upgrade.",
  ],
  [
    "Can I switch plans later?",
    "Yes. Upgrade or downgrade anytime. Upgrades are prorated; downgrades take effect at the end of the current cycle. Free users can upgrade to remove the watermark and unlock the full 66 content styles.",
  ],
  [
    "What's the difference between plans?",
    "Free gives you 4 watermarked gameplay videos/month. Every paid plan removes the watermark, unlocks all 66 niches, and includes 1 TikTok account. The difference between paid tiers is videos-per-week: 3 on Hatchling, 7 on Drake, 14 on Elder Dragon.",
  ],
  [
    "Do you offer discounts for longer commitments?",
    "Yes. 15% off on quarterly, 30% off on annual billing.",
  ],
  [
    "Can I cancel anytime?",
    "Absolutely. No contracts. Cancel from the dashboard and keep access through the end of your billing period.",
  ],
  [
    "Will my TikTok account get banned?",
    "No. We post through the official TikTok API via Late. Not bots or scrapers. Fully TOS-compliant.",
  ],
  [
    "Can I review videos before they post?",
    "Yes. Videos are queued in the dashboard. Preview, edit the schedule, or skip individual posts.",
  ],
  [
    "What niches work best?",
    "Reddit stories, true crime, horror, motivation, and dating drama are the top performers. 66 styles total. The AI picks trending angles within your chosen niche.",
  ],
];

export function PricingPageContent() {
  const [interval, setInterval] = useState<Interval>("MONTHLY");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <section className="sec-pad" style={{ textAlign: "center", paddingBottom: 40 }}>
        <div className="wrap">
          <div className="eyebrow">CH · PRICING</div>
          <h1 className="h-display mt-6">
            Pick your <span style={{ color: "var(--fire)", fontStyle: "italic" }}>dragon</span>.
            <br />
            Pick your pace.
          </h1>
          <p className="text-2 mt-6" style={{ fontSize: 18 }}>
            Cancel anytime. No contracts. No filming.
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
                  background: interval === i.value ? "var(--fire)" : "transparent",
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

      <section className="sec-pad">
        <div className="wrap">
          <div className="chapter-label">THE ARENA</div>
          <h2 className="h1 mt-4">
            How we burn <span style={{ color: "var(--fire)", fontStyle: "italic" }}>the competition.</span>
          </h2>
          <div
            className="mt-8"
            style={{
              overflowX: "auto",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius-base) * 2)",
            }}
          >
            <table className="compare-table">
              <thead>
                <tr>
                  <th>FEATURE</th>
                  <th style={{ color: "var(--fire)" }}>DRAGONMADEIT</th>
                  <th>AutoShorts</th>
                  <th>Faceless.so</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r, i) => (
                  <tr key={r[0]} style={{ background: i % 2 ? "var(--bg-1)" : "transparent" }}>
                    <td>{r[0]}</td>
                    <td className="hl">{r[1]}</td>
                    <td className="text-3">{r[2]}</td>
                    <td className="text-3">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec-pad" style={{ background: "var(--bg-1)" }}>
        <div className="wrap-narrow">
          <div className="chapter-label">THE RIDDLES</div>
          <h2 className="h1 mt-4">Questions the ancients ask.</h2>
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
          <h2 className="h1">
            Ready to <span style={{ color: "var(--fire)", fontStyle: "italic" }}>light the forge?</span>
          </h2>
          <p className="text-2 mt-4">Your first AI video could be live tonight. No card needed.</p>
          <div className="row gap-4 mt-8" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup?tier=free" className="btn btn-primary btn-lg">
              Start free — no card
            </Link>
            <Link href="/signup" className="btn btn-ghost btn-lg">
              Pick a paid tier →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
