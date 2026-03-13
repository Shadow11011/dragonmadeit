"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-6 px-4">
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold fire-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          DragonMadeIt
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-text-secondary max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Set it and forget it. AI-powered TikTok content automation.
        </motion.p>

        <motion.div
          className="pt-4 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        >
          <Link href="/login">
            <Button size="lg" className="glow-pulse">
              Start Automating
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
