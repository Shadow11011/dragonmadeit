"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const ScrollAnimation = dynamic(
  () =>
    import("@/components/marketing/ScrollAnimation").then(
      (mod) => mod.ScrollAnimation
    ),
  { ssr: false }
);

/** Total number of extracted WEBP frames */
const FRAME_COUNT = 150;

interface FeatureSlide {
  title: string;
  description: string;
  icon: string;
  /** Progress range [start, end] where this card is visible (0-1) */
  range: [number, number];
  side: "left" | "right";
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    title: "AI-Powered Content",
    description:
      "Generate engaging TikTok videos with AI scripts, images, and voiceovers — no editing required.",
    icon: "\u2728",
    range: [0.05, 0.3],
    side: "left",
  },
  {
    title: "Smart Scheduling",
    description:
      "Post at optimal times with intelligent scheduling. Pick your days and times, we handle the rest.",
    icon: "\uD83D\uDD52",
    range: [0.28, 0.53],
    side: "right",
  },
  {
    title: "Hands-Free Posting",
    description:
      "Set it and forget it. Your content generates, queues, and posts automatically to TikTok.",
    icon: "\u26A1",
    range: [0.51, 0.76],
    side: "left",
  },
  {
    title: "Watch It Grow",
    description:
      "Track performance with analytics. Scale from 3 videos a week to 14 as your audience grows.",
    icon: "\uD83D\uDCC8",
    range: [0.74, 0.98],
    side: "right",
  },
];

export function DragonScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasFrames, setHasFrames] = useState(false);
  const sectionInView = useInView(sectionRef, { amount: 0.01 });

  // Check if frames exist (try loading first frame)
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasFrames(true);
    img.onerror = () => setHasFrames(false);
    img.src = "/frames/dragon/frame_0001.webp";
  }, []);

  // Track scroll progress within this section
  useEffect(() => {
    if (!sectionInView) return;

    let rafId: number;

    function onScroll() {
      rafId = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight - window.innerHeight;
        const rawProgress = -rect.top / sectionHeight;
        const progress = Math.max(0, Math.min(1, rawProgress));

        setScrollProgress(progress);

        // Drive the canvas animation
        const container = canvasContainerRef.current;
        if (container) {
          const canvas = container.querySelector("canvas");
          if (canvas) {
            const setter = (
              canvas as unknown as Record<
                string,
                ((p: number) => void) | undefined
              >
            ).__setProgress;
            setter?.(progress);
          }
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [sectionInView]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "300vh" }}
    >
      {/* Sticky container — viewport height, stays in view while scrolling */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Dragon animation canvas */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          {hasFrames ? (
            <ScrollAnimation
              frameDir="dragon"
              frameCount={FRAME_COUNT}
              width={1920}
              height={1080}
            />
          ) : (
            /* Placeholder when frames aren't available yet */
            <DragonPlaceholder progress={scrollProgress} />
          )}
        </div>

        {/* Feature cards that appear at scroll progress points */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 h-full flex items-center">
          {FEATURE_SLIDES.map((slide) => {
            const isVisible =
              scrollProgress >= slide.range[0] &&
              scrollProgress <= slide.range[1];

            // Calculate opacity: fade in over first 20% of range, fade out over last 20%
            const rangeLength = slide.range[1] - slide.range[0];
            const fadeIn = (scrollProgress - slide.range[0]) / (rangeLength * 0.2);
            const fadeOut =
              (slide.range[1] - scrollProgress) / (rangeLength * 0.2);
            const opacity = isVisible
              ? Math.min(1, fadeIn, fadeOut)
              : 0;

            return (
              <motion.div
                key={slide.title}
                className={`absolute top-1/2 -translate-y-1/2 w-72 md:w-80 pointer-events-none ${
                  slide.side === "left"
                    ? "left-4 md:left-8 lg:left-12"
                    : "right-4 md:right-8 lg:right-12"
                }`}
                style={{ opacity }}
                animate={{
                  y: isVisible ? "-50%" : slide.side === "left" ? "-40%" : "-60%",
                  x: isVisible ? 0 : slide.side === "left" ? -30 : 30,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-[0_0_40px_rgba(255,69,0,0.08)]">
                  <span className="text-3xl block mb-3">{slide.icon}</span>
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2">
            {FEATURE_SLIDES.map((slide, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width:
                    scrollProgress >= slide.range[0] &&
                    scrollProgress <= slide.range[1]
                      ? "24px"
                      : "8px",
                  backgroundColor:
                    scrollProgress >= slide.range[0]
                      ? "#ff4500"
                      : "rgba(113, 113, 122, 0.3)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Placeholder shown when dragon frames aren't available yet.
 * Renders the existing Dragon2D SVG with a scale/glow effect driven by scroll.
 */
function DragonPlaceholder({ progress }: { progress: number }) {
  // Scale from 0.8 to 1.1 as user scrolls, glow intensifies
  const scale = 0.8 + progress * 0.3;
  const glowIntensity = Math.round(progress * 40);

  return (
    <div
      className="flex items-center justify-center transition-transform duration-100"
      style={{
        transform: `scale(${scale})`,
        filter: `drop-shadow(0 0 ${glowIntensity}px rgba(255, 69, 0, ${0.2 + progress * 0.4}))`,
      }}
    >
      {/* Fire orb placeholder that grows with scroll */}
      <div className="relative">
        <div
          className="w-64 h-64 md:w-96 md:h-96 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255, 69, 0, ${0.15 + progress * 0.25}), rgba(255, 140, 0, ${0.08 + progress * 0.12}), transparent 70%)`,
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 45%, rgba(255, 215, 0, ${progress * 0.2}), transparent 50%)`,
          }}
        />
        <p className="absolute inset-0 flex items-center justify-center text-text-secondary/50 text-sm text-center px-8">
          {progress < 0.1
            ? "Dragon animation will appear here"
            : ""}
        </p>
      </div>
    </div>
  );
}
