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

export function PricingSection() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");
  const { currency } = useCurrency();

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">04 — PRICING</div>

        <motion.h2
          className="text-4xl md:text-5xl font-bold font-heading text-text-primary text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          Pick your dragon, pick your pace
        </motion.h2>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {PAID_TIERS.map((tierKey, i) => {
            const config = TIER_CONFIG[tierKey];
            return (
              <motion.div
                key={tierKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <PricingTierCard
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
