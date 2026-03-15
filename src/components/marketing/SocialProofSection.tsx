"use client";

import { motion } from "framer-motion";

const metrics = [
  { value: "500+", label: "Videos generated" },
  { value: "50+", label: "Active creators" },
  { value: "99.9%", label: "Uptime" },
];

export default function SocialProofSection() {
  return (
    <section className="py-16 border-t border-border/30">
      <div className="mx-auto max-w-4xl px-4">
        <motion.p
          className="text-sm text-text-secondary mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Trusted by creators automating their TikTok growth
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
              <div className="text-2xl font-bold text-text-primary">
                {metric.value}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
