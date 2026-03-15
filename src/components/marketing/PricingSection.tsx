"use client";

import { motion } from "framer-motion";
import { PricingTierCard } from "@/components/marketing/PricingTierCard";
import { TIER_CONFIG, PaidTier } from "@/types";

const PAID_TIERS: PaidTier[] = ["HATCHLING", "DRAKE", "ELDER_DRAGON"];

const TIER_META: Record<PaidTier, { popular?: boolean }> = {
  HATCHLING: {},
  DRAKE: { popular: true },
  ELDER_DRAGON: {},
};

export function PricingSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold fire-text text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          Choose Your Dragon
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-14 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Scale from hatchling to elder dragon as your audience grows.
          Cancel anytime.
        </motion.p>

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
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
