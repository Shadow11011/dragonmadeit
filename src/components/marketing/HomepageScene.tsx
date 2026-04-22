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
import { Reveal } from "@/components/marketing/primitives/Reveal";

export function HomepageScene() {
  return (
    <div>
      <HeroSection />
      <section style={{ padding: "80px 24px 0", textAlign: "center" }}>
        <div className="wrap-narrow">
          <Reveal>
            <p
              className="text-2"
              style={{
                fontSize: 18,
                fontStyle: "italic",
                maxWidth: 560,
                margin: "0 auto",
                color: "var(--text-3)",
              }}
            >
              But here&rsquo;s what the algorithm is quietly doing to you&hellip;
            </p>
          </Reveal>
        </div>
      </section>
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
