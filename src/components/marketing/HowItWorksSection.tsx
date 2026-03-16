"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Pick your niche",
    description:
      "Choose from 66 story styles — Reddit stories, horror, motivation, true crime, and more. Pick a voice and video type. Done in 60 seconds.",
  },
  {
    number: "02",
    title: "AI creates your videos",
    description:
      "Our AI writes scripts, generates visuals, adds voiceover, and assembles full TikTok videos. No filming. No editing. No face needed.",
  },
  {
    number: "03",
    title: "Collect the views",
    description:
      "Videos post on your schedule automatically. Track views, engagement, and growth from your dashboard while you do literally anything else.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
          How it works
        </h2>
        <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
          From zero to posting in under 2 minutes. No camera. No skills. No excuses.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold text-accent-fire/15 mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
