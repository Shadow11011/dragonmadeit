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

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          Pick your dragon, pick your pace
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-3 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          3, 7, or 14 AI-generated videos per week. All fully automated. All faceless.
        </motion.p>
        <motion.p
          className="text-sm text-text-secondary text-center mb-10 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          A freelance video editor charges $50-100 per video. Our AI does it from $1.25.
        </motion.p>

        <div className="flex items-center justify-center gap-2 mb-14">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              billing === "monthly"
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              billing === "annual"
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Annual
            <span className="ml-2 text-xs bg-accent-fire/10 text-accent-fire px-2 py-0.5 rounded-full">
              Save 30%
            </span>
          </button>
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
                  price={config.monthlyPrice}
                  description={config.description}
                  features={config.features}
                  tierColor={config.fireColor}
                  popular={TIER_META[tierKey].popular}
                  billingPeriod={billing}
                  tierKey={tierKey}
                  videosPerWeek={config.videosPerWeek}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
