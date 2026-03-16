"use client";

import { motion } from "framer-motion";
import { HeroSection } from "@/components/marketing/HeroSection";
import SocialProofSection from "@/components/marketing/SocialProofSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";

function BeforeAfterSection() {
  return (
    <section className="py-24 bg-bg-secondary/30">
      <div className="mx-auto max-w-5xl px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Stop grinding. Start automating.
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-12 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Every week you&apos;re NOT automating:
        </motion.p>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Without */}
          <motion.div
            className="bg-bg-primary border border-red-500/20 rounded-xl p-6 md:p-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-red-400 mb-4">Without DragonMadeIt</h3>
            <ul className="space-y-3">
              {["10+ hours/week filming & editing", "Inconsistent posting kills reach", "Algorithm penalizes gaps", "$500-2,000/mo on freelancers", "Burnout from content treadmill"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          {/* With */}
          <motion.div
            className="bg-bg-primary border border-accent-fire/20 rounded-xl p-6 md:p-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold fire-text mb-4">With DragonMadeIt</h3>
            <ul className="space-y-3">
              {["0 hours — fully automated", "Daily posts on autopilot", "Algorithm rewards consistency", "Starting at $15/mo", "Set it once, collect views forever"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-primary">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-fire" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WhoItsForSection() {
  const audiences = [
    { title: "Side Hustlers", description: "Want passive TikTok income without quitting your day job." },
    { title: "Faceless Creators", description: "Build an audience without ever showing your face on camera." },
    { title: "Niche Explorers", description: "Test viral niches like Reddit stories, horror, or true crime with zero risk." },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Built for creators who want views, not fame
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-12 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          This is NOT for people chasing personal fame. This is for people who want the income without the camera.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              className="bg-bg-secondary border border-border rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">{a.title}</h3>
              <p className="text-sm text-text-secondary">{a.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { quote: "I set it up on a Sunday, and by Wednesday I had 3 videos posted automatically. This thing just works.", name: "Alex R.", niche: "Reddit Stories", handle: "@faceless_reads" },
    { quote: "I was spending $400/month on a freelance editor. Now I spend $39 and get daily posts. No-brainer.", name: "Jordan M.", niche: "True Crime", handle: "@crimechannel" },
    { quote: "67K views in my first month. I never showed my face once. The AI picks content that actually goes viral.", name: "Sam K.", niche: "Horror Stories", handle: "@darknarrations" },
  ];
  return (
    <section className="py-24 bg-bg-secondary/30">
      <div className="mx-auto max-w-5xl px-4">
        <motion.p
          className="text-sm text-accent-ember text-center mb-2 font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          What early users say
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Real creators. Real results.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-bg-primary border border-border rounded-xl p-6 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-sm text-text-primary leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="font-medium text-text-primary text-sm">{t.name}</div>
                <div className="text-xs text-text-secondary">{t.handle} &middot; {t.niche}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomepageScene() {
  return (
    <div>
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <BeforeAfterSection />
      <FeaturesSection />
      <WhoItsForSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
