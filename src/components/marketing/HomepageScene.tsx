"use client";

import { HeroSection } from "@/components/marketing/HeroSection";
import { DragonScrollSection } from "@/components/marketing/DragonScrollSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";

export function HomepageScene() {
  return (
    <div>
      <HeroSection />
      <DragonScrollSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
