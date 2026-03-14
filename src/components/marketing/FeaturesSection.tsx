"use client";

import { FeatureCard } from "@/components/marketing/FeatureCard";

const FEATURES = [
  {
    title: "AI Content Generation",
    description:
      "Generate engaging TikTok content with AI-powered scripts and visuals",
    iconChar: "\u2728", // sparkles
  },
  {
    title: "Smart Scheduling",
    description:
      "Post at optimal times with our intelligent scheduling algorithm",
    iconChar: "\uD83D\uDD52", // clock
  },
  {
    title: "Hands-Free Content Pipeline",
    description: "We generate, schedule, and post videos to your TikTok account automatically",
    iconChar: "\uD83D\uDC65", // people
  },
  {
    title: "Performance Analytics",
    description:
      "Track views, engagement, and growth across all accounts",
    iconChar: "\uD83D\uDCCA", // chart
  },
  {
    title: "Automated Posting",
    description:
      "Set it and forget it — your content posts automatically",
    iconChar: "\u26A1", // lightning
  },
  {
    title: "Brand Consistency",
    description:
      "Maintain your brand voice across all automated content",
    iconChar: "\uD83C\uDFAF", // target
  },
];

export function FeaturesSection() {
  return (
    <section className="min-h-screen flex items-center justify-center py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
