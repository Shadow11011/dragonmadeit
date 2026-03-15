"use client";

import { HeroSection } from "@/components/marketing/HeroSection";
import SocialProofSection from "@/components/marketing/SocialProofSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";

export function HomepageScene() {
  return (
    <div>
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
