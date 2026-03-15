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
          Ready to automate your TikTok?
        </h2>
        <p className="text-text-secondary mb-8">
          Start posting AI-generated content in minutes. No credit card
          required.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-10 py-4 rounded-lg transition-colors"
        >
          Start Free
        </Link>
      </motion.div>
    </section>
  );
}
