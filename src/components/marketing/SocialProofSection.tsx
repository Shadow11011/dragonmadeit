"use client";

import { motion } from "framer-motion";

const metrics = [
  { value: "100%", label: "Hands-free automation" },
  { value: "66", label: "Viral content niches" },
  { value: "24/7", label: "Autopilot posting" },
];

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
        <div className="flex flex-wrap items-center justify-center gap-12">
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-text-primary">
                {metric.value}
              </div>
              <div className="text-sm text-text-secondary mt-1">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
