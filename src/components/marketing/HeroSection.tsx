"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-4 py-20">
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold fire-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          DragonMadeIt
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-text-secondary max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        >
          Set it and forget it. AI-powered TikTok content automation.
        </motion.p>

        <motion.div
          className="pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
        >
          <Link href="/signup">
            <Button size="lg" className="glow-pulse">
              Start Automating
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
