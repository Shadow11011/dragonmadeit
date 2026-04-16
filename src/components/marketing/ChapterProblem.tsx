"use client";

import { motion } from "framer-motion";

const painPoints = [
  "10+ hours/week filming & editing",
  "Inconsistent posting kills your reach",
  "The algorithm penalizes gaps",
  "$500–2,000/mo on freelance editors",
  "Burnout from the content treadmill",
];

const withDragon = [
  "0 hours — fully automated",
  "Daily posts on autopilot",
  "Algorithm rewards your consistency",
  "Starting at $15/mo",
  "Set it once, collect views forever",
];

export function ChapterProblem() {
  return (
    <section id="chapter-01" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">01 — THE PROBLEM</div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary leading-[1.15] mb-6">
              Every week you&apos;re not automating:
            </h2>
            <ul className="space-y-3">
              {painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-text-secondary">
                  <svg className="mt-1 h-4 w-4 shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-accent-fire/5 border border-accent-fire/15 rounded-lg p-6">
              <h3 className="font-heading text-lg text-accent-fire mb-4">With DragonMadeIt</h3>
              <ul className="space-y-3">
                {withDragon.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-text-primary text-sm">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-fire" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
