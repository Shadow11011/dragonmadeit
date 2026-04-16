"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <motion.h1
        className="font-heading text-[clamp(2.5rem,5vw,3.5rem)] text-text-primary text-center max-w-3xl leading-[1.1] tracking-[-0.5px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        The faceless content engine for TikTok.
      </motion.h1>

      <motion.p
        className="mt-6 text-base text-text-secondary text-center max-w-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      >
        AI writes your scripts, generates videos, and posts them to TikTok on autopilot. 66 content styles. Zero filming. You collect the views.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      >
        <Link
          href="/signup"
          className="bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-8 py-3 rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(255,69,0,0.25)]"
        >
          Launch your channel — $15/mo
        </Link>
        <a
          href="#chapter-01"
          className="text-text-secondary hover:text-accent-fire transition-colors text-sm inline-flex items-center gap-1"
        >
          See how it works →
        </a>
      </motion.div>
    </section>
  );
}
