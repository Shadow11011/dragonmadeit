"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PricingTierCard } from "@/components/marketing/PricingTierCard";
import { TIER_CONFIG, PaidTier } from "@/types";
import { cn } from "@/lib/utils";

const PAID_TIERS: PaidTier[] = ["HATCHLING", "DRAKE", "ELDER_DRAGON"];

const TIER_META: Record<PaidTier, { popular?: boolean }> = {
  HATCHLING: {},
  DRAKE: { popular: true },
  ELDER_DRAGON: {},
};

const FAQ = [
  {
    question: "Can I switch plans later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remaining billing period. When downgrading, the change takes effect at the end of your current billing cycle.",
  },
  {
    question: "What's the difference between plans?",
    answer:
      "Every paid plan includes 1 TikTok account. The main difference is how many videos per week we generate and post for you — from 3/week on Hatchling up to 14/week (2x daily) on Elder Dragon. Elder Dragon also includes a custom content generation system.",
  },
  {
    question: "Do you offer discounts for longer commitments?",
    answer:
      "Yes! Save 15% with quarterly billing or 30% with annual billing. Contact us after signup to switch to a longer billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe payment processing.",
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
            Choose your dragon tier
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start mb-24">
          {PAID_TIERS.map((tierKey) => {
            const config = TIER_CONFIG[tierKey];
            return (
              <PricingTierCard
                key={tierKey}
                name={config.name}
                price={config.monthlyPrice}
                description={config.description}
                features={config.features}
                tierColor={config.fireColor}
                popular={TIER_META[tierKey].popular}
              />
            );
          })}
        </div>

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
      </div>
    </div>
  );
}
