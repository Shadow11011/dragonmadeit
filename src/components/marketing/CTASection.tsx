"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 border-t border-border">
      <motion.div
        className="text-center px-4 max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary mb-4">
          Your first AI video could be live tonight.
        </h2>
        <p className="text-text-secondary mb-8">
          Pick a niche. Our AI handles the rest. Cancel anytime.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-10 py-4 rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(255,69,0,0.25)]"
        >
          Get my first videos for $15/mo
        </Link>
        <div className="mt-4 text-xs text-text-secondary">
          14-day money-back guarantee &middot; Cancel anytime &middot; Secured by Paystack
        </div>
      </motion.div>
    </section>
  );
}
