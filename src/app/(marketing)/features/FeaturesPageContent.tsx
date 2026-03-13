"use client";

import { motion } from "framer-motion";

interface FeatureDetail {
  title: string;
  description: string;
  subFeatures: string[];
}

const FEATURES: FeatureDetail[] = [
  {
    title: "AI Content Generation",
    description:
      "Let our AI create scroll-stopping TikTok content for you. From scripts to visuals, our pipeline uses cutting-edge generative AI to produce content that resonates with your audience.",
    subFeatures: [
      "AI-generated scripts tailored to trending topics",
      "Flux-powered image generation for eye-catching visuals",
      "Edge TTS and KokoroTTS voice synthesis for narration",
      "Automatic video assembly with FFmpeg pipeline",
      "Template library with customizable styles",
    ],
  },
  {
    title: "Smart Scheduling & Automation",
    description:
      "Our intelligent scheduling algorithm analyzes your audience's behavior to post at the perfect time, every time. Set your strategy once and let automation handle the rest.",
    subFeatures: [
      "Optimal posting time detection per account",
      "Queue-based content pipeline — never miss a day",
      "Timezone-aware scheduling across regions",
      "Batch scheduling for weeks or months ahead",
      "Pause and resume with a single click",
    ],
  },
  {
    title: "Multi-Account Management",
    description:
      "Whether you manage one account or dozens, our unified dashboard keeps everything organized. Switch between accounts instantly and maintain unique strategies for each.",
    subFeatures: [
      "Centralized dashboard for all accounts",
      "Per-account content queues and strategies",
      "Bulk actions across multiple accounts",
      "Account health monitoring and alerts",
      "Team collaboration (Elder Dragon tier)",
    ],
  },
  {
    title: "Performance Analytics",
    description:
      "Understand what works and what doesn't. Our analytics dashboard tracks every metric that matters, giving you actionable insights to grow faster.",
    subFeatures: [
      "Real-time view and engagement tracking",
      "Content performance comparison",
      "Growth trend visualization",
      "Best-performing content identification",
      "Export reports for stakeholders",
    ],
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
          <div
            className="w-full max-w-sm aspect-square rounded-2xl border border-border flex items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,69,0,0.08) 0%, rgba(18,18,26,0.8) 70%)",
            }}
          >
            <div className="text-center space-y-3">
              <div className="text-5xl text-accent-fire opacity-50">
                {index === 0 && <span>&#x2728;</span>}
                {index === 1 && <span>&#x1F552;</span>}
                {index === 2 && <span>&#x1F465;</span>}
                {index === 3 && <span>&#x1F4CA;</span>}
              </div>
              <p className="text-sm text-text-secondary font-medium">
                {feature.title}
              </p>
            </div>
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
            Features
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Everything you need to dominate TikTok. From AI-powered content
            generation to intelligent scheduling, we handle the hard work so you
            can focus on growing.
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
            Ready to get started?
          </h2>
          <p className="text-text-secondary mb-8">
            Choose a plan and start automating your TikTok content today.
          </p>
          <a
            href="/pricing"
            className="inline-block px-8 py-3 rounded-lg bg-accent-fire text-white font-semibold hover:brightness-110 transition-all glow-pulse"
          >
            View Pricing
          </a>
        </motion.div>
      </div>
    </div>
  );
}
