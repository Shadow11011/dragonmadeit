"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32">
      <motion.div
        className="text-center px-4 space-y-6 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
          Ready to Dominate TikTok?
        </h2>
        <p className="text-lg text-text-secondary max-w-md mx-auto">
          Let the dragon handle your content while you focus on what matters.
        </p>
        <div className="pt-4">
          <Link href="/signup">
            <Button size="lg" className="glow-pulse text-base px-10 py-4">
              Start Automating Today
            </Button>
          </Link>
        </div>
        <p className="text-xs text-text-secondary/50 pt-2">
          No credit card required to sign up
        </p>
      </motion.div>
    </section>
  );
}
