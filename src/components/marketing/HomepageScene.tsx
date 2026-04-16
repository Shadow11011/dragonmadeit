"use client";

import { HeroSection } from "@/components/marketing/HeroSection";
import SocialProofSection from "@/components/marketing/SocialProofSection";
import { ChapterProblem } from "@/components/marketing/ChapterProblem";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ChapterProof } from "@/components/marketing/ChapterProof";
import { CTASection } from "@/components/marketing/CTASection";

export function HomepageScene() {
  return (
    <div>
      <HeroSection />
      <SocialProofSection />
      <ChapterProblem />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <ChapterProof />
      <CTASection />
    </div>
  );
}
