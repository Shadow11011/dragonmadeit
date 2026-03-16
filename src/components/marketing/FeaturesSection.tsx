"use client";

import { FeatureCard } from "@/components/marketing/FeatureCard";

const FEATURES = [
  {
    title: "66 Story Archetypes",
    description:
      "Reddit stories, true crime, horror, motivation, dating drama, gym culture — pick your niche and we write the scripts",
    iconChar: "\uD83D\uDCDD",
  },
  {
    title: "AI Voice & Visuals",
    description:
      "Male, female, or random voices paired with gameplay footage or AI-generated images. Full videos, zero filming.",
    iconChar: "\uD83C\uDFA4",
  },
  {
    title: "Fully Automated Pipeline",
    description:
      "Script \u2192 voiceover \u2192 visuals \u2192 video \u2192 posted to TikTok. The entire chain runs without you.",
    iconChar: "\u26A1",
  },
  {
    title: "Up to 14 Videos/Week",
    description:
      "Post 3x, 7x, or 14x per week. Consistency is what the algorithm rewards \u2014 we never miss a day.",
    iconChar: "\uD83D\uDD25",
  },
  {
    title: "Growth Analytics",
    description:
      "Track views, likes, shares, and engagement rate. See what content styles perform best.",
    iconChar: "\uD83D\uDCCA",
  },
  {
    title: "No Face Required",
    description:
      "Join the 38% of creators building faceless channels. Your audience cares about content, not your camera.",
    iconChar: "\uD83D\uDC7B",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-bg-secondary/30">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
          Your entire content team, automated
        </h2>
        <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
          Writer. Voice actor. Video editor. Posting manager. All replaced by
          one dragon.
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
