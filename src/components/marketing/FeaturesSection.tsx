"use client";

import { motion } from "framer-motion";

const FEATURES = [
  { title: "66 Viral Niches", description: "Reddit stories, true crime, horror, motivation, dating drama — pick your niche and our AI writes scripts that hook viewers in the first 3 seconds." },
  { title: "Studio-quality videos", description: "AI-generated visuals, professional voiceover, and polished editing — full TikTok videos without a camera, mic, or editing software." },
  { title: "Script to screen, zero effort", description: "Script, voiceover, visuals, video, posted to TikTok. The entire pipeline runs without you lifting a finger." },
  { title: "Post every day (or twice)", description: "3x, 7x, or 14x per week — the algorithm rewards consistency, and your dragon never misses a scheduled post." },
  { title: "See what's working", description: "Track views, likes, shares, and engagement. Know exactly which niches and styles perform best so you can double down." },
  { title: "No face. No filming. No editing.", description: "Join the growing wave of faceless creators. Your audience cares about content, not your camera." },
];

export function FeaturesSection() {
  return (
    <section id="chapter-03" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">03 — WHAT YOU GET</div>

        <motion.h2
          className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary leading-[1.15] mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Your entire content team, automated
        </motion.h2>
        <p className="text-text-secondary mb-12 max-w-lg">
          Writer. Voice actor. Video editor. Posting manager. All replaced by one dragon.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <h3 className="text-base font-semibold text-text-primary mb-1">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-[50ch]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
