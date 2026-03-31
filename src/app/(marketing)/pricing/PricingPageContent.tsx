"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PricingTierCard } from "@/components/marketing/PricingTierCard";
import { TIER_CONFIG, type PaidTier, type BillingInterval } from "@/types";
import { useCurrency } from "@/lib/geo";
import { cn } from "@/lib/utils";

const PAID_TIERS: PaidTier[] = ["HATCHLING", "DRAKE", "ELDER_DRAGON"];

const TIER_META: Record<PaidTier, { popular?: boolean }> = {
  HATCHLING: {},
  DRAKE: { popular: true },
  ELDER_DRAGON: {},
};

const BILLING_OPTIONS: { value: BillingInterval; label: string; badge?: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly", badge: "Save 15%" },
  { value: "ANNUAL", label: "Annual", badge: "Save 30%" },
];

const FAQ = [
  {
    question: "Can I switch plans later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remaining billing period. When downgrading, the change takes effect at the end of your current billing cycle.",
  },
  {
    question: "What's the difference between plans?",
    answer:
      "Every paid plan includes 1 TikTok account. The main difference is how many videos per week we generate and post for you \u2014 from 3/week on Hatchling up to 14/week (2x daily) on Elder Dragon. Elder Dragon also includes a custom content generation system.",
  },
  {
    question: "Do you offer discounts for longer commitments?",
    answer:
      "Yes! Save 15% with quarterly billing or 30% with annual billing. Select your preferred billing cycle on the pricing toggle above.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major cards, bank transfers, and mobile money through Gumroad secure payment processing.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. There are no long-term contracts. Cancel anytime from your dashboard settings and you'll retain access until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee. If you're not satisfied within the first 14 days, contact our support team for a full refund.",
  },
  {
    question: "Will my TikTok account get banned?",
    answer:
      "No. We post through the official TikTok API via Late.dev \u2014 not bots or scrapers. Your account is safe and fully compliant with TikTok's terms of service.",
  },
  {
    question: "What does the AI content look like?",
    answer:
      "Our AI generates unique scripts, pairs them with AI-generated images or gameplay footage, and adds professional voiceover. Each video is unique and optimized for TikTok's format.",
  },
  {
    question: "How is this different from AutoShorts?",
    answer:
      "We start at $15/mo (vs $19), offer 66 content styles (vs limited templates), and handle the full pipeline from script to post. Most tools just schedule \u2014 we create AND post.",
  },
  {
    question: "Can I review videos before they post?",
    answer:
      "Videos are generated and queued automatically. You can preview any video in your dashboard before its scheduled posting time and skip or reschedule if needed.",
  },
  {
    question: "What niches work best?",
    answer:
      "Reddit stories, true crime, horror, motivation, and dating drama are our top performers. But with 66 content styles, there's something for every niche. Our AI optimizes for what's trending.",
  },
];

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-border"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        className="w-full flex items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-text-primary font-medium">{question}</span>
        <svg
          className={cn(
            "h-5 w-5 text-text-secondary transition-transform shrink-0 ml-4",
            open && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-40 pb-5" : "max-h-0"
        )}
      >
        <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
      </div>
    </motion.div>
  );
}

export function PricingPageContent() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");
  const { currency } = useCurrency();

  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold fire-text mb-4">
            Pricing
          </h1>
          <p className="text-lg text-text-secondary">
            Choose your dragon tier. Cancel anytime. 14-day money-back guarantee.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-1 mb-14 bg-bg-secondary rounded-lg p-1 w-fit mx-auto">
          {BILLING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setBillingInterval(option.value)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                billingInterval === option.value
                  ? "bg-bg-tertiary text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {option.label}
              {option.badge && (
                <span className="ml-2 text-xs bg-accent-fire/10 text-accent-fire px-2 py-0.5 rounded-full">
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start mb-24">
          {PAID_TIERS.map((tierKey) => {
            const config = TIER_CONFIG[tierKey];
            return (
              <PricingTierCard
                key={tierKey}
                name={config.name}
                description={config.description}
                features={config.features}
                tierColor={config.fireColor}
                popular={TIER_META[tierKey].popular}
                billingInterval={billingInterval}
                tierKey={tierKey}
                videosPerWeek={config.videosPerWeek}
                currency={currency}
              />
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div
          className="max-w-3xl mx-auto mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
            DragonMadeIt vs. the alternatives
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 text-accent-fire font-semibold">
                    DragonMadeIt
                  </th>
                  <th className="text-center py-3 px-4 text-text-secondary font-medium">
                    AutoShorts
                  </th>
                  <th className="text-center py-3 px-4 text-text-secondary font-medium">
                    Faceless.so
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Starting price", dragon: currency === "NGN" ? "\u20a623,000/mo" : "$15/mo", auto: "$19/mo", faceless: "$29/mo" },
                  { feature: "Creates videos", dragon: "\u2713", auto: "\u2713", faceless: "\u2713" },
                  { feature: "Posts to TikTok", dragon: "\u2713", auto: "\u2713", faceless: "\u2014" },
                  { feature: "Content styles", dragon: "66", auto: "Limited", faceless: "Limited" },
                  { feature: "Full automation", dragon: "\u2713", auto: "Partial", faceless: "\u2014" },
                  { feature: "Custom voices", dragon: "\u2713", auto: "\u2713", faceless: "\u2014" },
                  { feature: "14-day guarantee", dragon: "\u2713", auto: "\u2014", faceless: "\u2014" },
                ].map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border/50",
                      i % 2 === 0 && "bg-bg-secondary/30"
                    )}
                  >
                    <td className="py-3 px-4 text-text-primary">{row.feature}</td>
                    <td className="py-3 px-4 text-center font-medium text-accent-fire">
                      {row.dragon}
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary">
                      {row.auto}
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary">
                      {row.faceless}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-text-primary text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div>
            {FAQ.map((item, index) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center py-16 mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Seen enough?
          </h2>
          <p className="text-text-secondary mb-6">
            Pick a plan and start automating tonight.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg bg-accent-fire text-white font-semibold hover:bg-accent-fire/90 transition-colors glow-pulse"
          >
            See Plans from {currency === "NGN" ? "\u20a623,000" : "$15"}/mo
          </a>
          <p className="text-xs text-text-secondary mt-3">
            14-day money-back guarantee. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
