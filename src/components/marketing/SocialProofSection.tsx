"use client";

import { motion } from "framer-motion";

export default function SocialProofSection() {
  return (
    <section className="py-16 bg-bg-secondary/50">
      <div className="mx-auto max-w-4xl px-4">
        <motion.p
          className="text-sm text-text-secondary mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          You pick the niche. AI makes the videos. TikTok gets the posts. You never touch an editor.
        </motion.p>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <span className="text-sm text-text-secondary">66 content styles</span>
          <span className="text-text-secondary/40">&middot;</span>
          <span className="text-sm text-text-secondary">100% hands-free</span>
          <span className="text-text-secondary/40">&middot;</span>
          <span className="text-sm text-text-secondary">Posts 24/7 on autopilot</span>
        </motion.div>
      </div>
    </section>
  );
}
