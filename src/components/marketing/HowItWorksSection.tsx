"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect your TikTok",
    description:
      "Link your account with one click. Choose your content style and posting schedule.",
  },
  {
    number: "02",
    title: "We generate content",
    description:
      "Our AI creates videos with custom scripts, images, and voiceovers tailored to your audience.",
  },
  {
    number: "03",
    title: "Watch it grow",
    description:
      "Content posts automatically on your schedule. Track performance and refine as you grow.",
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
          Get your TikTok on autopilot in three simple steps.
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
