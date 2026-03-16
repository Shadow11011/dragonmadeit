"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface FeatureDetail {
  title: string;
  description: string;
  subFeatures: string[];
  image: string;
}

const FEATURES: FeatureDetail[] = [
  {
    title: "AI Content Generation",
    description:
      "Our AI handles the entire creative process — scripts, visuals, voiceover, and final assembly. Every video is unique and optimized for TikTok's algorithm.",
    subFeatures: [
      "AI-generated scripts tailored to trending topics",
      "Flux-powered image generation for eye-catching visuals",
      "Edge TTS and KokoroTTS voice synthesis for narration",
      "Automatic video assembly with FFmpeg pipeline",
      "66 content styles across every trending niche",
    ],
    image: "/images/features/ai-content-generation.png",
  },
  {
    title: "Smart Scheduling & Automation",
    description:
      "Set your posting schedule once and your dragon handles the rest. Videos are generated, queued, and posted without you touching a thing.",
    subFeatures: [
      "Automated posting on your chosen schedule",
      "Queue-based content pipeline — never miss a day",
      "Timezone-aware scheduling",
      "Pause and resume with a single click",
      "Batch scheduling for weeks ahead",
    ],
    image: "/images/features/smart-scheduling.png",
  },
  {
    title: "66 Viral Content Styles",
    description:
      "From Reddit stories to true crime, horror to motivation — pick the niches that resonate with your audience. Our AI knows what hooks viewers in the first 3 seconds.",
    subFeatures: [
      "Reddit stories, true crime, horror, motivation, and more",
      "Each niche optimized for engagement and virality",
      "Mix and match styles for variety",
      "AI selects trending topics within your niche",
      "New styles added regularly based on TikTok trends",
    ],
    image: "/images/features/multi-account-management.png",
  },
  {
    title: "Performance Analytics",
    description:
      "Know exactly what's working. Track every metric that matters and double down on your best-performing content styles.",
    subFeatures: [
      "Real-time view and engagement tracking",
      "Content performance comparison across styles",
      "Growth trend visualization",
      "Best-performing content identification",
      "Data-driven niche optimization",
    ],
    image: "/images/features/performance-analytics.png",
  },
];

function FeatureSection({
  feature,
  index,
}: {
  feature: FeatureDetail;
  index: number;
}) {
  const isReversed = index % 2 === 1;

  return (
    <motion.section
      className="py-16 md:py-24"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div
        className={`flex flex-col ${
          isReversed ? "md:flex-row-reverse" : "md:flex-row"
        } gap-8 md:gap-16 items-center`}
      >
        {/* Text content */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {feature.title}
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            {feature.description}
          </p>
          <ul className="space-y-3">
            {feature.subFeatures.map((sub) => (
              <li
                key={sub}
                className="flex items-start gap-3 text-sm text-text-primary"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-fire"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {sub}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual element */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-border overflow-hidden">
            <Image
              src={feature.image}
              alt={feature.title}
              width={896}
              height={512}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export function FeaturesPageContent() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold fire-text mb-4">
            One tool. Full pipeline.
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Script to screen to TikTok — fully automated. Here&apos;s every step we handle.
          </p>
        </motion.div>

        {/* Feature sections */}
        <div className="divide-y divide-border/50">
          {FEATURES.map((feature, index) => (
            <FeatureSection
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Seen enough? Pick a plan.
          </h2>
          <p className="text-text-secondary mb-8">
            Start automating your TikTok tonight.
          </p>
          <a
            href="/pricing"
            className="inline-block px-8 py-3 rounded-lg bg-accent-fire text-white font-semibold hover:bg-accent-fire/90 transition-colors"
          >
            See Plans from $15/mo
          </a>
        </motion.div>
      </div>
    </div>
  );
}
