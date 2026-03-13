"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="min-h-screen flex items-center justify-center pointer-events-none">
      <motion.div
        className="text-center px-4 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
          Ready to Dominate TikTok?
        </h2>
        <p className="text-lg text-text-secondary max-w-md mx-auto">
          Join thousands of creators automating their content
        </p>
        <div className="pt-4 pointer-events-auto">
          <Link href="/login">
            <Button size="lg" className="glow-pulse text-base px-10 py-4">
              Start Automating — It&apos;s Free
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
