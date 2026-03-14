"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";

function DragonSilhouette() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-48 h-48 md:w-64 md:h-64 opacity-20"
      style={{ animation: "dragon-float 4s ease-in-out infinite" }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 30 C120 20, 150 35, 140 60 C155 55, 175 65, 165 85 C180 90, 175 115, 155 115 C160 130, 145 145, 130 140 C125 155, 105 160, 100 150 C95 160, 75 155, 70 140 C55 145, 40 130, 45 115 C25 115, 20 90, 35 85 C25 65, 45 55, 60 60 C50 35, 80 20, 100 30Z"
        fill="#ff4500"
        opacity="0.3"
      />
      <path
        d="M85 80 C85 75, 90 72, 92 78"
        stroke="#ffd700"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M115 80 C115 75, 110 72, 108 78"
        stroke="#ffd700"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Wings */}
      <path
        d="M60 60 C30 30, 10 50, 20 80 L45 85Z"
        fill="#ff4500"
        opacity="0.2"
      />
      <path
        d="M140 60 C170 30, 190 50, 180 80 L155 85Z"
        fill="#ff4500"
        opacity="0.2"
      />
    </svg>
  );
}

function EmberParticles() {
  const embers = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: 2 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            left: ember.left,
            bottom: "-10px",
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            background: ember.id % 2 === 0 ? "#ff4500" : "#ff8c00",
            animation: `ember-float ${ember.duration} ease-in infinite`,
            animationDelay: ember.delay,
          }}
        />
      ))}
    </div>
  );
}

export function MobileFallback() {
  return (
    <div className="relative">
      {/* Hero with gradient background */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at center, #12121a 0%, #0a0a0f 70%)",
        }}
      >
        <EmberParticles />

        <div className="relative z-10 text-center space-y-6 px-4">
          <DragonSilhouette />

          <motion.h1
            className="text-5xl sm:text-6xl font-bold fire-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            DragonMadeIt
          </motion.h1>

          <motion.p
            className="text-lg text-text-secondary max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Set it and forget it. AI-powered TikTok content automation.
          </motion.p>

          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/signup">
              <Button size="lg" className="glow-pulse">
                Start Automating
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Additional sections */}
      <FeaturesSection />
      <PricingSection />
      <CTASection />

      <style>{`
        @keyframes dragon-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
