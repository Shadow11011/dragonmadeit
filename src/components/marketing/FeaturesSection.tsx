"use client";

import { FeatureCard } from "@/components/marketing/FeatureCard";

const FEATURES = [
  {
    title: "AI Content Generation",
    description:
      "Generate engaging TikTok content with AI-powered scripts and visuals",
    iconChar: "\u2728",
  },
  {
    title: "Smart Scheduling",
    description:
      "Post at optimal times with our intelligent scheduling algorithm",
    iconChar: "\uD83D\uDD52",
  },
  {
    title: "Hands-Free Content Pipeline",
    description:
      "We generate, schedule, and post videos to your TikTok account automatically",
    iconChar: "\uD83D\uDC65",
  },
  {
    title: "Performance Analytics",
    description:
      "Track views, engagement, and growth across all accounts",
    iconChar: "\uD83D\uDCCA",
  },
  {
    title: "Automated Posting",
    description:
      "Set it and forget it \u2014 your content posts automatically",
    iconChar: "\u26A1",
  },
  {
    title: "Brand Consistency",
    description:
      "Maintain your brand voice across all automated content",
    iconChar: "\uD83C\uDFAF",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-bg-secondary/30">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
          Everything you need
        </h2>
        <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
          A complete TikTok automation platform built for creators who want
          results.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={<span>{feature.iconChar}</span>}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
