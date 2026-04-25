"use client";

import { HeroSection } from "@/components/marketing/HeroSection";
import { StatRibbon } from "@/components/marketing/StatRibbon";
import { NicheMarquee } from "@/components/marketing/NicheMarquee";
import { ChapterProblem } from "@/components/marketing/ChapterProblem";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { FoundersCaseStudy } from "@/components/marketing/FoundersCaseStudy";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";

export function HomepageScene() {
  return (
    <div>
      <HeroSection />
      <ChapterProblem />
      <div className="wrap">
        <div className="molten-divider" />
      </div>
      <HowItWorksSection />
      <NicheMarquee />
      <StatRibbon />
      <FeaturesSection />
      <FoundersCaseStudy />
      <PricingSection />
      <CTASection />
    </div>
  );
}
