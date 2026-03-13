"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PricingTierCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  tierColor: string;
  popular?: boolean;
}

export function PricingTierCard({
  name,
  price,
  description,
  features,
  tierColor,
  popular = false,
}: PricingTierCardProps) {
  return (
    <motion.div
      className={cn(
        "relative bg-bg-secondary rounded-xl p-6 md:p-8 border-2 flex flex-col",
        popular && "md:scale-105 md:-my-2"
      )}
      style={{ borderColor: tierColor }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-bg-primary"
          style={{ backgroundColor: tierColor }}
        >
          Most Popular
        </div>
      )}

      <h3 className="text-xl font-bold" style={{ color: tierColor }}>
        {name}
      </h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-text-primary">
          ${price}
        </span>
        <span className="text-text-secondary text-sm">/mo</span>
      </div>

      <p className="mt-2 text-sm text-text-secondary">{description}</p>

      <ul className="mt-6 space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: tierColor }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-text-primary">{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/login" className="mt-8 block">
        <Button
          className="w-full"
          style={{
            backgroundColor: tierColor,
            color: "#0a0a0f",
          }}
        >
          Get Started
        </Button>
      </Link>
    </motion.div>
  );
}
