"use client";

import { FeatureCard } from "@/components/marketing/FeatureCard";

const FEATURES = [
  {
    title: "AI Content Generation",
    description:
      "Generate engaging TikTok content with AI-powered scripts and visuals",
    icon: <span>&#x2728;</span>, // sparkles
  },
  {
    title: "Smart Scheduling",
    description:
      "Post at optimal times with our intelligent scheduling algorithm",
    icon: <span>&#x1F552;</span>, // clock
  },
  {
    title: "Multi-Account Management",
    description: "Manage multiple TikTok accounts from one dashboard",
    icon: <span>&#x1F465;</span>, // people
  },
  {
    title: "Performance Analytics",
    description:
      "Track views, engagement, and growth across all accounts",
    icon: <span>&#x1F4CA;</span>, // chart
  },
  {
    title: "Automated Posting",
    description:
      "Set it and forget it — your content posts automatically",
    icon: <span>&#x26A1;</span>, // lightning
  },
  {
    title: "Brand Consistency",
    description:
      "Maintain your brand voice across all automated content",
    icon: <span>&#x1F3AF;</span>, // target
  },
];

export function FeaturesSection() {
  return (
    <section className="min-h-screen flex items-center justify-center py-20 pointer-events-none">
      <div className="mx-auto max-w-5xl px-4 pointer-events-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
