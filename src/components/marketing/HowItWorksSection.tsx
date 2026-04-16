"use client";

import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Pick your niche", description: "Choose from 66 story styles — Reddit, horror, motivation, true crime. Pick a voice and video type. Done in 60 seconds." },
  { number: "02", title: "AI creates your videos", description: "Scripts, visuals, voiceover, editing — full TikTok videos assembled without a camera, mic, or editing software." },
  { number: "03", title: "Watch it grow", description: "Videos post on your schedule automatically. Track views and engagement from your dashboard while you sleep." },
];

export default function HowItWorksSection() {
  return (
    <section id="chapter-02" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">02 — HOW IT WORKS</div>

        <motion.h2
          className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary leading-[1.15] mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          From zero to posting in under 2 minutes
        </motion.h2>
        <p className="text-text-secondary mb-12 max-w-lg">No camera. No skills. No excuses.</p>

        <motion.div
          className="w-full rounded-xl border border-border overflow-hidden bg-bg-secondary mb-16"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-tertiary border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error/40" />
              <div className="w-3 h-3 rounded-full bg-warning/40" />
              <div className="w-3 h-3 rounded-full bg-success/40" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-text-secondary">dragonmadeit.app/dashboard</span>
            </div>
          </div>
          <div className="aspect-video bg-bg-primary p-6 flex items-center justify-center">
            <p className="text-text-secondary text-sm">Dashboard preview</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-xs text-accent-fire font-semibold mb-2">{step.number}</div>
              <h3 className="font-heading text-lg text-text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
