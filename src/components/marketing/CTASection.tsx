"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 border-t border-border/30">
      <motion.div
        className="text-center px-4 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Your first AI video could be live tonight.
        </h2>
        <p className="text-text-secondary mb-8">
          Pick a niche. Our AI handles the rest. Cancel anytime. 14-day money-back guarantee.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-10 py-4 rounded-lg transition-colors glow-pulse"
        >
          Get My First Videos for $15/mo
        </Link>
        {/* Guarantee badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          14-day money-back guarantee · Cancel anytime · Secured by Paystack
        </div>
      </motion.div>
    </section>
  );
}
