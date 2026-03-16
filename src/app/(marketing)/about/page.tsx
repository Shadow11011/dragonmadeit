"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold fire-text">
            About DragonMadeIt
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            One dev. One dragon. One mission: automate faceless TikTok.
          </p>
        </motion.div>

        {/* Why I built this */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-secondary border border-border rounded-xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold text-accent-fire">Why I built this</h2>
          <p className="text-text-secondary leading-relaxed">
            I got obsessed with faceless TikTok. The idea that you could build an audience
            and generate income without ever showing your face — that hooked me. But the
            reality? Hours of scripting, recording voiceovers, editing clips, and manually
            posting every single day. It was a full-time job pretending to be passive income.
          </p>
          <p className="text-text-secondary leading-relaxed">
            So I built DragonMadeIt. An AI dragon that handles the entire pipeline — from
            writing scripts to generating visuals to posting on TikTok — while I sleep. Now
            I&apos;m making it available to every side hustler who wants the same thing: real
            TikTok growth without the grind.
          </p>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Pick your niche",
                description: "Choose from 66 content styles — Reddit stories, horror, motivation, true crime, and more. Set your voice and video preferences.",
              },
              {
                step: "02",
                title: "AI does the work",
                description: "Flux generates images. KokoroTTS handles voiceover. FFmpeg assembles the video. Late API posts it to TikTok. All automated by n8n.",
              },
              {
                step: "03",
                title: "You collect the views",
                description: "Videos post on your schedule automatically. Watch your analytics grow while you work your day job, sleep, or plan your next niche.",
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

        {/* The Stack */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-secondary border border-border rounded-xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold text-accent-ember">The stack</h2>
          <p className="text-text-secondary leading-relaxed">
            No vague &ldquo;cutting-edge AI&rdquo; marketing. Here&apos;s exactly what powers your content:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            {[
              "Flux — AI image generation",
              "KokoroTTS / Edge TTS — voiceover synthesis",
              "FFmpeg — video assembly pipeline",
              "Late API — official TikTok posting",
              "n8n — workflow automation engine",
              "Next.js + Prisma — dashboard & data",
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

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-6"
        >
          <h2 className="text-2xl font-bold">Ready to let the dragon work for you?</h2>
          <p className="text-text-secondary">
            14-day money-back guarantee. Cancel anytime.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 rounded-lg bg-accent-fire text-white font-semibold hover:brightness-110 transition-all glow-pulse"
          >
            Start Automating — From $15/mo
          </Link>
        </motion.section>
      </div>
    </main>
  );
}
