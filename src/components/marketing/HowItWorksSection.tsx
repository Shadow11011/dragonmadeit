"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Pick your niche",
    description:
      "Choose from 66 story styles — Reddit stories, horror, motivation, true crime, and more. Pick a voice and video type. Done in 60 seconds.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "AI creates your videos",
    description:
      "Our AI writes scripts, generates visuals, adds voiceover, and assembles full TikTok videos. No filming. No editing. No face needed.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Watch it grow",
    description:
      "Videos post on your schedule automatically. Track views, engagement, and growth from your dashboard while you sleep, work your day job, or start account #2.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
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
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Timeline connector line — desktop only */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-accent-fire/20 via-accent-fire/40 to-accent-fire/20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Step icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-fire/10 text-accent-fire mb-4">
                {step.icon}
              </div>
              {/* Step number */}
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
