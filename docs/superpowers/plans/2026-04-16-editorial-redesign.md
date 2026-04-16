# Editorial Magazine Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform DragonMadeIt from a generic SaaS template into an editorial magazine-style site with chapter book layout, Young Serif typography, and warm dark palette — across marketing, dashboard, and auth.

**Architecture:** Replace Bricolage Grotesque with Young Serif for headings. Rewrite all marketing components to use numbered chapter sections with varied layouts (split, full-width, text-grid). Update dashboard components to use Young Serif headings with editorial sidebar (text-only nav, dot indicators). All changes are frontend-only — no API/DB changes.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Young Serif (Google Fonts), Figtree (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-04-16-editorial-redesign-design.md`

---

## Task 1: Foundation — Font Swap + CSS Utilities

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace Bricolage Grotesque with Young Serif in layout.tsx**

```tsx
// src/app/layout.tsx — change the import and font config
import { Young_Serif, Figtree } from "next/font/google";

const heading = Young_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-heading",
});
```

Figtree stays as-is. The body className stays the same (`${heading.variable} ${body.variable} font-body bg-bg-primary text-text-primary antialiased`).

- [ ] **Step 2: Update font-heading fallback in globals.css**

Replace the `.font-heading` block:
```css
.font-heading {
  font-family: var(--font-heading), Georgia, serif;
}
```

And update `.font-body`:
```css
.font-body {
  font-family: var(--font-body), system-ui, sans-serif;
}
```

- [ ] **Step 3: Update Tailwind fontFamily fallbacks**

In `tailwind.config.ts`, change the heading fallback from sans-serif to serif:
```ts
fontFamily: {
  heading: ["var(--font-heading)", "Georgia", "serif"],
  body: ["var(--font-body)", "system-ui", "sans-serif"],
},
```

- [ ] **Step 4: Add chapter-label utility class in globals.css**

Append to globals.css:
```css
/* Chapter label — editorial section markers */
.chapter-label {
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--accent-fire);
  padding-top: 16px;
  border-top: 1px solid var(--border);
  margin-bottom: 24px;
}
```

- [ ] **Step 5: Build and verify**

```bash
cd /root/dragonmadeit && pnpm build 2>&1 | tail -5
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat: swap to Young Serif + add chapter-label utility"
```

---

## Task 2: Shared Button Component

**Files:**
- Modify: `src/components/ui/Button.tsx`

- [ ] **Step 1: Update Button — remove brightness hover, add subtle lift**

Replace the primary variant class:
```tsx
"bg-accent-fire text-white hover:bg-accent-fire/90 hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(255,69,0,0.25)]": variant === "primary",
```

This replaces `hover:brightness-110` with a physical lift + shadow — more editorial, less SaaS.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat: editorial button hover — lift + shadow instead of brightness"
```

---

## Task 3: Editorial Navbar

**Files:**
- Modify: `src/components/marketing/Navbar.tsx`

- [ ] **Step 1: Rewrite the Navbar**

The nav needs: Young Serif logo, no glassmorphism, no backdrop-blur. Rewrite the component:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {!announcementDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-accent-fire text-white text-center text-sm py-2 px-4 flex items-center justify-center">
          <span className="flex-1 text-center font-body">
            Launch pricing — lock in current rates before they increase
          </span>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="ml-4 text-white/80 hover:text-white transition-colors shrink-0"
            aria-label="Dismiss announcement"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <motion.header
        className={cn(
          "fixed left-0 right-0 z-50 bg-bg-primary border-b border-border",
          announcementDismissed ? "top-0" : "top-[36px]"
        )}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-heading text-xl fire-text">
              <Image
                src="/images/dragon-mascot.png"
                alt="DragonMadeIt mascot"
                width={32}
                height={32}
                className="rounded-sm"
              />
              DragonMadeIt
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm transition-colors",
                    pathname === link.href
                      ? "text-accent-fire font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/pricing">
                <Button size="sm">See Pricing</Button>
              </Link>
            </div>

            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className={cn("block h-0.5 w-6 bg-text-primary transition-transform", mobileOpen && "translate-y-2 rotate-45")} />
              <span className={cn("block h-0.5 w-6 bg-text-primary transition-opacity", mobileOpen && "opacity-0")} />
              <span className={cn("block h-0.5 w-6 bg-text-primary transition-transform", mobileOpen && "-translate-y-2 -rotate-45")} />
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-bg-primary/70" onClick={() => setMobileOpen(false)} />
        )}

        <div className={cn(
          "md:hidden bg-bg-primary border-t border-border overflow-hidden transition-all duration-200 ease-in-out relative z-50",
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="px-4 py-4 space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block transition-colors",
                  pathname === link.href ? "text-accent-fire font-medium" : "text-text-secondary hover:text-text-primary"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            <Link href="/login" className="block text-text-secondary hover:text-text-primary transition-colors" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)}>
              <Button className="w-full" size="sm">See Pricing</Button>
            </Link>
          </div>
        </div>
      </motion.header>
    </>
  );
}
```

Key changes from current:
- `bg-bg-primary` solid background instead of `nav-blur` class
- `font-heading` on logo
- Mobile overlay: `bg-bg-primary/70` not `bg-black/50`
- No emoji in announcement bar

- [ ] **Step 2: Commit**

```bash
git add src/components/marketing/Navbar.tsx
git commit -m "feat: editorial navbar — solid bg, Young Serif logo, no blur"
```

---

## Task 4: Editorial Hero Section

**Files:**
- Modify: `src/components/marketing/HeroSection.tsx`

- [ ] **Step 1: Rewrite HeroSection — text-first editorial hero**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <motion.h1
        className="font-heading text-[clamp(2.5rem,5vw,3.5rem)] text-text-primary text-center max-w-3xl leading-[1.1] tracking-[-0.5px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        The faceless content engine for TikTok.
      </motion.h1>

      <motion.p
        className="mt-6 text-base text-text-secondary text-center max-w-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      >
        AI writes your scripts, generates videos, and posts them to TikTok on autopilot. 66 content styles. Zero filming. You collect the views.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      >
        <Link
          href="/signup"
          className="bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-8 py-3 rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(255,69,0,0.25)]"
        >
          Launch your channel — $15/mo
        </Link>
        <a
          href="#chapter-01"
          className="text-text-secondary hover:text-accent-fire transition-colors text-sm inline-flex items-center gap-1"
        >
          See how it works &rarr;
        </a>
      </motion.div>
    </section>
  );
}
```

Key changes:
- No dashboard mockup — text IS the design
- `font-heading` on h1 with clamp() fluid sizing
- Sentence-case CTA (not "Launch Your Channel")
- Secondary action is a text link with arrow, not a bordered button
- No glow-pulse
- Varied animations (fade+y for heading, fade-only for body, fade+y shorter for CTA)

- [ ] **Step 2: Commit**

```bash
git add src/components/marketing/HeroSection.tsx
git commit -m "feat: editorial hero — text-first, no mockup, Young Serif headline"
```

---

## Task 5: Chapter Sections — Homepage Rewrite

**Files:**
- Modify: `src/components/marketing/HomepageScene.tsx`
- Modify: `src/components/marketing/SocialProofSection.tsx` (already done — keep as-is)
- Modify: `src/components/marketing/HowItWorksSection.tsx`
- Modify: `src/components/marketing/FeaturesSection.tsx`
- Delete: `src/components/marketing/FeatureCard.tsx` (no longer needed)

- [ ] **Step 1: Rewrite HomepageScene — chapter book structure**

```tsx
"use client";

import { HeroSection } from "@/components/marketing/HeroSection";
import SocialProofSection from "@/components/marketing/SocialProofSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";
import { ChapterProblem } from "@/components/marketing/ChapterProblem";
import { ChapterProof } from "@/components/marketing/ChapterProof";

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
```

- [ ] **Step 2: Create ChapterProblem component (01 — THE PROBLEM)**

Create `src/components/marketing/ChapterProblem.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

const painPoints = [
  "10+ hours/week filming & editing",
  "Inconsistent posting kills your reach",
  "The algorithm penalizes gaps",
  "$500–2,000/mo on freelance editors",
  "Burnout from the content treadmill",
];

const withDragon = [
  "0 hours — fully automated",
  "Daily posts on autopilot",
  "Algorithm rewards your consistency",
  "Starting at $15/mo",
  "Set it once, collect views forever",
];

export function ChapterProblem() {
  return (
    <section id="chapter-01" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">01 — THE PROBLEM</div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          {/* Left — pain points (60%) */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary leading-[1.15] mb-6">
              Every week you&apos;re not automating:
            </h2>
            <ul className="space-y-3">
              {painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-text-secondary">
                  <svg className="mt-1 h-4 w-4 shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — with DragonMadeIt (40%) */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-accent-fire/5 border border-accent-fire/15 rounded-lg p-6">
              <h3 className="font-heading text-lg text-accent-fire mb-4">With DragonMadeIt</h3>
              <ul className="space-y-3">
                {withDragon.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-text-primary text-sm">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-fire" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Rewrite HowItWorksSection (02 — HOW IT WORKS)**

```tsx
"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Pick your niche",
    description: "Choose from 66 story styles — Reddit, horror, motivation, true crime. Pick a voice and video type. Done in 60 seconds.",
  },
  {
    number: "02",
    title: "AI creates your videos",
    description: "Scripts, visuals, voiceover, editing — full TikTok videos assembled without a camera, mic, or editing software.",
  },
  {
    number: "03",
    title: "Watch it grow",
    description: "Videos post on your schedule automatically. Track views and engagement from your dashboard while you sleep.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="chapter-02" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">02 — HOW IT WORKS</div>

        <motion.h2
          className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary leading-[1.15] mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          From zero to posting in under 2 minutes
        </motion.h2>
        <p className="text-text-secondary mb-12 max-w-lg">
          No camera. No skills. No excuses.
        </p>

        {/* Dashboard screenshot placeholder */}
        <motion.div
          className="w-full rounded-xl border border-border overflow-hidden bg-bg-secondary mb-16"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-tertiary border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error/40" />
              <div className="w-3 h-3 rounded-full bg-warning/40" />
              <div className="w-3 h-3 rounded-full bg-success/40" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-text-secondary">dragonmadeit.app/dashboard</span>
            </div>
          </div>
          <div className="aspect-video bg-bg-primary p-6 flex items-center justify-center">
            <p className="text-text-secondary text-sm">Dashboard preview</p>
          </div>
        </motion.div>

        {/* Three steps — text row, no icons, no circles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-xs text-accent-fire font-semibold mb-2">{step.number}</div>
              <h3 className="font-heading text-lg text-text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Rewrite FeaturesSection (03 — WHAT YOU GET) — text grid, no cards**

```tsx
"use client";

import { motion } from "framer-motion";

const FEATURES = [
  { title: "66 Viral Niches", description: "Reddit stories, true crime, horror, motivation, dating drama — pick your niche and our AI writes scripts that hook viewers in the first 3 seconds." },
  { title: "Studio-quality videos", description: "AI-generated visuals, professional voiceover, and polished editing — full TikTok videos without a camera, mic, or editing software." },
  { title: "Script to screen, zero effort", description: "Script, voiceover, visuals, video, posted to TikTok. The entire pipeline runs without you lifting a finger." },
  { title: "Post every day (or twice)", description: "3x, 7x, or 14x per week — the algorithm rewards consistency, and your dragon never misses a scheduled post." },
  { title: "See what's working", description: "Track views, likes, shares, and engagement. Know exactly which niches and styles perform best so you can double down." },
  { title: "No face. No filming. No editing.", description: "Join the growing wave of faceless creators. Your audience cares about content, not your camera." },
];

export function FeaturesSection() {
  return (
    <section id="chapter-03" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">03 — WHAT YOU GET</div>

        <motion.h2
          className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary leading-[1.15] mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Your entire content team, automated
        </motion.h2>
        <p className="text-text-secondary mb-12 max-w-lg">
          Writer. Voice actor. Video editor. Posting manager. All replaced by one dragon.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <h3 className="text-base font-semibold text-text-primary mb-1">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-[50ch]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Delete FeatureCard.tsx**

```bash
rm src/components/marketing/FeatureCard.tsx
```

- [ ] **Step 6: Build and verify**

```bash
pnpm build 2>&1 | tail -5
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: chapter book homepage — Problem, HowItWorks, Features sections"
```

---

## Task 6: Pricing + Testimonials + CTA Chapters

**Files:**
- Modify: `src/components/marketing/PricingSection.tsx`
- Modify: `src/components/marketing/PricingTierCard.tsx`
- Modify: `src/components/marketing/CTASection.tsx`
- Create: `src/components/marketing/ChapterProof.tsx`

- [ ] **Step 1: Add chapter label to PricingSection**

In `PricingSection.tsx`, add the chapter label before the h2 and apply `font-heading` to the h2. Replace the `<motion.h2>` block:

```tsx
<div className="chapter-label">04 — PRICING</div>
<motion.h2
  className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary mb-4"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.6 }}
>
  Pick your dragon, pick your pace
</motion.h2>
```

Remove the two `<motion.p>` elements below the h2 (the "3, 7, or 14..." and "A freelance video editor..." lines). The chapter label and heading are enough — editorial means less copy.

- [ ] **Step 2: Update PricingTierCard — border-top accent, no full border**

Replace the outer `<motion.div>` className and style:

```tsx
<motion.div
  className={cn(
    "relative rounded-lg p-6 md:p-8 bg-bg-secondary flex flex-col",
    popular && "md:scale-105 md:-my-2"
  )}
  style={{
    borderTop: `3px solid ${tierColor}`,
  }}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

Add `font-heading` to the tier name `<h3>`:
```tsx
<h3 className="font-heading text-xl" style={{ color: tierColor }}>
```

- [ ] **Step 3: Create ChapterProof (05 — WHAT CREATORS SAY) — pull quotes**

Create `src/components/marketing/ChapterProof.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

const testimonials = [
  { quote: "I set it up on a Sunday, and by Wednesday I had 3 videos posted automatically. This thing just works.", name: "Alex R.", handle: "@faceless_reads", niche: "Reddit Stories" },
  { quote: "I was spending $400/month on a freelance editor. Now I spend $39 and get daily posts. No-brainer.", name: "Jordan M.", handle: "@crimechannel", niche: "True Crime" },
  { quote: "67K views in my first month. I never showed my face once. The AI picks content that actually goes viral.", name: "Sam K.", handle: "@darknarrations", niche: "Horror Stories" },
];

export function ChapterProof() {
  return (
    <section id="chapter-05" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="chapter-label">05 — WHAT CREATORS SAY</div>

        <div className="space-y-16">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className={cn(i % 2 === 1 ? "md:pl-24" : "")}
              initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-heading text-xl md:text-2xl text-text-primary leading-[1.4]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-4 text-sm text-text-secondary">
                {t.name} &middot; <span className="text-accent-fire">{t.handle}</span> &middot; {t.niche}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Wait — the `cn` import is missing. Add it:
```tsx
import { cn } from "@/lib/utils";
```

- [ ] **Step 4: Rewrite CTASection — minimal editorial**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 border-t border-border">
      <motion.div
        className="text-center px-4 max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] text-text-primary mb-4">
          Your first AI video could be live tonight.
        </h2>
        <p className="text-text-secondary mb-8">
          Pick a niche. Our AI handles the rest. Cancel anytime.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-accent-fire hover:bg-accent-fire/90 text-white font-semibold px-10 py-4 rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(255,69,0,0.25)]"
        >
          Get my first videos for $15/mo
        </Link>
        <div className="mt-4 text-xs text-text-secondary">
          14-day money-back guarantee &middot; Cancel anytime &middot; Secured by Paystack
        </div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 5: Build and verify**

```bash
pnpm build 2>&1 | tail -5
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: pricing chapter, pull-quote testimonials, editorial CTA"
```

---

## Task 7: Editorial Footer

**Files:**
- Modify: `src/components/marketing/Footer.tsx`

- [ ] **Step 1: Update Footer — Young Serif column headings**

Add `font-heading` to the logo link, all three column headings (`<h3>` tags), and the copyright brand span. The footer is already clean — this is a targeted edit.

Edit the logo link class:
```tsx
<Link href="/" className="font-heading text-xl fire-text">
```

Edit each `<h3>` class:
```tsx
<h3 className="font-heading text-sm text-text-primary mb-4">Product</h3>
```
(Same for "Company" and "Legal")

- [ ] **Step 2: Commit**

```bash
git add src/components/marketing/Footer.tsx
git commit -m "feat: editorial footer — Young Serif headings"
```

---

## Task 8: Dashboard Sidebar — Editorial Style

**Files:**
- Modify: `src/components/dashboard/Sidebar.tsx`

- [ ] **Step 1: Update Sidebar — text-only nav with dot indicators**

Key changes to make in the existing Sidebar.tsx:

a) Replace the brand `<span>` in the header with Young Serif:
```tsx
<span className="font-heading text-lg fire-text">DragonMadeIt</span>
```
(Do this for both the mobile header bar and the sidebar header.)

b) Replace icon-based nav items with dot indicators. In the nav map, replace:
```tsx
<span className="shrink-0">{item.icon}</span>
```
with:
```tsx
<span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-accent-fire" : "bg-border")} />
```

c) Replace the gradient "Add Account" button:
```tsx
className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-accent-fire hover:bg-accent-fire/90 transition-all"
```

d) Replace mobile overlay `bg-black/50` with `bg-bg-primary/70`.

e) Replace mobile header `bg-bg-secondary/80 backdrop-blur-md` with `bg-bg-secondary`.

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/Sidebar.tsx
git commit -m "feat: editorial sidebar — dot nav, Young Serif brand, no blur"
```

---

## Task 9: Dashboard StatsCard + Dashboard Page

**Files:**
- Modify: `src/components/dashboard/StatsCard.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Update StatsCard — Young Serif label, remove hover glow**

```tsx
export function StatsCard({ label, value, icon, trend, accentColor }: StatsCardProps) {
  return (
    <div className="rounded-lg bg-bg-secondary border border-border p-5">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-lg"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {icon}
        </span>
        <span className="font-heading text-xs text-text-secondary">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium mb-0.5",
              trend.isPositive ? "text-success" : "text-error"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
```

Changes: `rounded-xl` → `rounded-lg`, removed `hover:border-accent-fire/30`, added `font-heading` to label.

- [ ] **Step 2: Update Dashboard page — Young Serif heading, remove gradient buttons**

In `src/app/(app)/dashboard/page.tsx`:

a) Change the greeting h1:
```tsx
<h1 className="font-heading text-2xl text-text-primary">
```
(Remove `text-3xl font-bold`, use `font-heading text-2xl` — editorial sizing.)

b) Change the "Your first video is 5 minutes away" h2:
```tsx
<h2 className="font-heading text-xl text-text-primary mb-2">
```

c) Replace the gradient "Add Your First Account" button:
```tsx
<Button size="md">
  Add your first account
</Button>
```
(Remove the gradient className override. Sentence case.)

d) Change "Quick Actions" heading:
```tsx
<h2 className="font-heading text-xl mb-4">Quick actions</h2>
```

e) Remove `hover:border-accent-fire/30` from the Quick Actions link cards. Use just `hover:border-border` or remove hover border entirely.

- [ ] **Step 3: Build and verify**

```bash
pnpm build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/StatsCard.tsx src/app/\(app\)/dashboard/page.tsx
git commit -m "feat: editorial dashboard — Young Serif headings, clean stats cards"
```

---

## Task 10: Remaining Dashboard Pages

**Files:**
- Modify: `src/app/(app)/dashboard/accounts/page.tsx`
- Modify: `src/app/(app)/dashboard/schedule/page.tsx`
- Modify: `src/app/(app)/dashboard/analytics/page.tsx`
- Modify: `src/app/(app)/dashboard/settings/page.tsx`

- [ ] **Step 1: Add `font-heading` to all dashboard page titles**

For each dashboard sub-page, find the main `<h1>` or page title heading and add `font-heading` class. These are straightforward find-and-replace edits:

- `accounts/page.tsx`: find `<h1` → add `font-heading`
- `schedule/page.tsx`: find `<h1` → add `font-heading`
- `analytics/page.tsx`: find `<h1` → add `font-heading`
- `settings/page.tsx`: find `<h1` → add `font-heading`

Also find any `<h2>` section headings in these pages and add `font-heading`.

- [ ] **Step 2: Remove any gradient buttons or hover:border-accent-fire patterns**

Search each file for:
- `bg-gradient-to-r from-[#ff4500] to-[#ff8c00]` → replace with `bg-accent-fire`
- `hover:border-accent-fire/30` → remove
- `backdrop-blur` → remove

- [ ] **Step 3: Build and verify**

```bash
pnpm build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/dashboard/
git commit -m "feat: editorial dashboard sub-pages — Young Serif headings throughout"
```

---

## Task 11: Auth Pages

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/signup/page.tsx`
- Modify: `src/app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: Add `font-heading` to auth page titles**

Each auth page has a heading ("Sign in", "Create account", "Forgot password"). Add `font-heading` to each.

- [ ] **Step 2: Replace any gradient or glow patterns**

Search for `bg-gradient-to-r`, `glow-pulse`, `backdrop-blur` and remove/replace with solid `bg-accent-fire`.

- [ ] **Step 3: Build and verify**

```bash
pnpm build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: editorial auth pages — Young Serif headings, clean forms"
```

---

## Task 12: Marketing Sub-Pages (Features, Pricing, About)

**Files:**
- Modify: `src/app/(marketing)/pricing/page.tsx`
- Modify: `src/app/(marketing)/features/page.tsx`
- Modify: `src/app/(marketing)/about/page.tsx`

- [ ] **Step 1: Add `font-heading` to all page headings**

Each marketing sub-page has `<h1>` and `<h2>` elements. Add `font-heading` to all of them.

- [ ] **Step 2: Remove any AI slop patterns**

Search for: `bg-gradient-to-r`, `glow-pulse`, `fire-gradient` on text, `backdrop-blur`, `hover:border-accent-fire/30` repeated identically, identical `translateY` animations.

- [ ] **Step 3: Build and verify**

```bash
pnpm build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(marketing\)/
git commit -m "feat: editorial marketing sub-pages — Young Serif headings"
```

---

## Task 13: Final Build + Anti-Slop Audit

**Files:** None (verification only)

- [ ] **Step 1: Full build**

```bash
cd /root/dragonmadeit && pnpm build 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 2: Anti-slop grep audit**

```bash
echo "=== Inter font ===" && grep -r "Inter" src/ --include="*.tsx" --include="*.ts" -l
echo "=== gradient-clip text ===" && grep -r "background-clip.*text\|webkit-text-fill" src/ --include="*.css" --include="*.tsx" -l
echo "=== backdrop-filter ===" && grep -r "backdrop-filter\|backdrop-blur" src/ --include="*.tsx" --include="*.css" -l
echo "=== cyan ===" && grep -r "22d3ee\|cyan" src/ --include="*.tsx" --include="*.ts" --include="*.css" -l
echo "=== glow-pulse ===" && grep -r "glow-pulse\|glow-fire" src/ --include="*.tsx" -l
echo "=== gradient buttons ===" && grep -r "bg-gradient-to-r" src/ --include="*.tsx" -l
```

Expected: Zero matches on all checks (except `fire-gradient` class on progress bar backgrounds, which is allowed).

- [ ] **Step 3: Verify Young Serif is loading**

```bash
curl -s http://localhost:3000 | grep -o "Young.Serif" | head -3
```

Expected: At least one match.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A && git status
```

If clean, no commit needed. If fixes were made, commit them.
