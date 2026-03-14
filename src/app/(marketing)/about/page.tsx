"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold fire-text">
            About DragonMadeIt
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            We&apos;re building the future of TikTok content automation.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-secondary border border-border rounded-xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold text-accent-fire">Our Mission</h2>
          <p className="text-text-secondary leading-relaxed">
            DragonMadeIt was born from a simple frustration: creating consistent,
            engaging TikTok content is incredibly time-consuming. Creators and brands
            spend hours every week recording, editing, and posting — time that could
            be spent on strategy, creativity, or growing their business.
          </p>
          <p className="text-text-secondary leading-relaxed">
            We built DragonMadeIt to solve this. Our AI-powered platform handles the
            entire content pipeline — from generation to scheduling to posting — so
            you can set it and forget it. Think of us as your tireless content dragon,
            working around the clock to grow your TikTok presence.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect",
                description:
                  "Link your TikTok accounts and configure your brand voice and content preferences.",
              },
              {
                step: "02",
                title: "Automate",
                description:
                  "Our AI generates content, schedules posts at optimal times, and handles publishing automatically.",
              },
              {
                step: "03",
                title: "Grow",
                description:
                  "Watch your audience grow while you focus on what matters. Review analytics and refine your strategy.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-bg-secondary border border-border rounded-xl p-6 text-center space-y-3"
              >
                <span className="text-4xl font-bold fire-text">{item.step}</span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-secondary border border-border rounded-xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold text-accent-ember">Our Technology</h2>
          <p className="text-text-secondary leading-relaxed">
            Under the hood, DragonMadeIt combines cutting-edge AI for content
            generation, intelligent scheduling algorithms that analyze your
            audience&apos;s activity patterns, and seamless TikTok API integration
            for automated posting. Every piece of content goes through quality checks
            before it reaches your audience.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            {[
              "AI-powered content generation",
              "Intelligent scheduling algorithms",
              "Real-time analytics tracking",
              "Automated quality assurance",
              "Multi-account management",
              "Brand voice consistency",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-accent-fire flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-secondary">{feature}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-6"
        >
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-text-secondary">
            Join creators who are already automating their TikTok growth.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg bg-accent-fire text-white font-semibold hover:brightness-110 transition-all glow-pulse"
          >
            Start Automating — It&apos;s Free
          </a>
        </motion.section>
      </div>
    </main>
  );
}
