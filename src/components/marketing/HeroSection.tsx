"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
          AI-powered faceless TikTok automation from $15/mo
        </span>
      </motion.div>

      <motion.h1
        className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary text-center max-w-4xl leading-tight mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
      >
        Launch a Faceless TikTok That
        <br />
        <span className="fire-text">Posts Itself.</span>
      </motion.h1>

      <motion.p
        className="mt-6 text-lg text-text-secondary text-center max-w-xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
      >
        AI writes your scripts, generates videos, and posts them to TikTok on
        autopilot. 66 content styles. Zero filming. You collect the views.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
      >
        <Link
          href="/signup"
          className="bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors glow-pulse"
        >
          Launch Your Channel — $15/mo
        </Link>
        <a
          href="#how-it-works"
          className="border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
          </svg>
          Watch How It Works
        </a>
      </motion.div>

      {/* Dashboard mockup */}
      <motion.div
        className="mt-16 w-full max-w-4xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.32 }}
      >
        <div className="relative rounded-xl border border-border overflow-hidden bg-bg-secondary shadow-2xl shadow-accent-fire/5">
          {/* Browser chrome bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-tertiary border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-text-secondary">dragonmadeit.com/dashboard</span>
            </div>
          </div>
          {/* Placeholder dashboard preview */}
          <div className="aspect-video bg-bg-primary p-6 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 bg-bg-secondary rounded-lg p-4 border border-border">
                <div className="text-xs text-text-secondary mb-1">Videos This Week</div>
                <div className="text-2xl font-bold text-text-primary">7</div>
                <div className="mt-2 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div className="h-full w-[70%] rounded-full fire-gradient" />
                </div>
              </div>
              <div className="flex-1 bg-bg-secondary rounded-lg p-4 border border-border">
                <div className="text-xs text-text-secondary mb-1">Total Views</div>
                <div className="text-2xl font-bold text-accent-fire">12.4K</div>
              </div>
              <div className="flex-1 bg-bg-secondary rounded-lg p-4 border border-border hidden sm:block">
                <div className="text-xs text-text-secondary mb-1">Next Post</div>
                <div className="text-2xl font-bold text-accent-ember">2h 15m</div>
              </div>
            </div>
            <div className="flex-1 bg-bg-secondary rounded-lg p-4 border border-border">
              <div className="text-xs text-text-secondary mb-2">Upcoming Schedule</div>
              <div className="space-y-2">
                {[
                  { time: "Today 6:00 PM", niche: "Reddit Stories", status: "Ready" },
                  { time: "Tomorrow 12:00 PM", niche: "True Crime", status: "Generating" },
                  { time: "Tomorrow 6:00 PM", niche: "Horror", status: "Queued" },
                ].map((item) => (
                  <div key={item.time} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{item.time}</span>
                    <span className="text-text-primary">{item.niche}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      item.status === "Ready" ? "bg-green-500/10 text-green-400" :
                      item.status === "Generating" ? "bg-accent-fire/10 text-accent-fire" :
                      "bg-bg-tertiary text-text-secondary"
                    )}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
