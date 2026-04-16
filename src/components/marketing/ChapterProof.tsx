"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const testimonials = [
  { quote: "I set it up on a Sunday, and by Wednesday I had 3 videos posted automatically. This thing just works.", name: "Alex R.", handle: "@faceless_reads", niche: "Reddit Stories" },
  { quote: "I was spending $400/month on a freelance editor. Now I spend $39 and get daily posts. No-brainer.", name: "Jordan M.", handle: "@crimechannel", niche: "True Crime" },
  { quote: "67K views in my first month. I never showed my face once. The AI picks content that actually goes viral.", name: "Sam K.", handle: "@darknarrations", niche: "Horror Stories" },
];

export function ChapterProof() {
  return (
    <section id="chapter-05" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">05 — WHAT CREATORS SAY</div>

        <div className="space-y-16">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className={cn(i % 2 === 1 ? "md:pl-24" : "")}
              initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-heading text-xl md:text-2xl text-text-primary leading-[1.4]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-4 text-sm text-text-secondary">
                {t.name} &middot; <span className="text-accent-fire">{t.handle}</span> &middot; {t.niche}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
