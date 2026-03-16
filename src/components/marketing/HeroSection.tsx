"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-4">
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-fire/30 text-xs text-accent-ember bg-accent-fire/5">
          #1 Faceless TikTok Automation Platform
        </span>
      </motion.div>

      <motion.h1
        className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary text-center max-w-4xl leading-tight mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
      >
        Start a Faceless TikTok
        <br />
        <span className="fire-text">in 60 Seconds.</span>
      </motion.h1>

      <motion.p
        className="mt-6 text-lg text-text-secondary text-center max-w-xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
      >
        AI generates your videos. We post them automatically. You never show
        your face. Choose from 66 content styles and let your dragon handle the rest.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
      >
        <Link
          href="/signup"
          className="bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Start Automating
        </Link>
        <a
          href="#how-it-works"
          className="border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary px-8 py-3 rounded-lg transition-colors"
        >
          See how it works
        </a>
      </motion.div>
    </section>
  );
}
