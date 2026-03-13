"use client";

import { motion } from "framer-motion";
import { PricingTierCard } from "@/components/marketing/PricingTierCard";

const TIERS = [
  {
    name: "Hatchling",
    price: 19,
    description: "Perfect for getting started with TikTok automation",
    tierColor: "#22d3ee",
    features: [
      "1 TikTok account",
      "Basic scheduling",
      "Content templates",
      "Email support",
    ],
  },
  {
    name: "Drake",
    price: 49,
    description: "For serious creators scaling their presence",
    tierColor: "#ff8c00",
    popular: true,
    features: [
      "5 TikTok accounts",
      "Advanced scheduling",
      "Analytics dashboard",
      "Priority support",
      "Custom templates",
    ],
  },
  {
    name: "Elder Dragon",
    price: 99,
    description: "Unlimited power for agencies and power users",
    tierColor: "#ffd700",
    features: [
      "Unlimited accounts",
      "Priority everything",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

export function PricingSection() {
  return (
    <section className="min-h-screen flex items-center justify-center py-20 pointer-events-none">
      <div className="mx-auto max-w-5xl px-4 pointer-events-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold fire-text text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Choose Your Dragon
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Scale from hatchling to elder dragon as you grow
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {TIERS.map((tier) => (
            <PricingTierCard key={tier.name} {...tier} />
          ))}
        </div>
      </div>
    </section>
  );
}
