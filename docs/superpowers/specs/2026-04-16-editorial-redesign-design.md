# DragonMadeIt — Editorial Magazine Redesign

**Date:** 2026-04-16
**Status:** Approved design, pending implementation

---

## 1. Design Identity

DragonMadeIt's redesign follows an **Editorial Magazine** direction — the site reads like a well-designed pitch deck or publication, not a SaaS landing page. Every section is a numbered "chapter" with its own layout rhythm. The editorial feel carries from marketing into the dashboard for full brand cohesion.

### Design DNA
- **Inspired by:** Vercel's precision + Runway/Ferrari editorial layouts + pitch deck chapter structure
- **Not inspired by:** generic SaaS templates, AI-generated layouts, glassmorphism, gradient text
- **Core principle:** the text IS the design. Typography and layout do the heavy lifting, not decorative effects.

### What Makes This Distinctive
- Numbered chapter sections (01 — The Problem, 02 — How It Works...) with thin rule dividers
- Serif display font (Young Serif) — almost no SaaS uses serif headings
- Asymmetric layouts — side-by-side content blocks instead of centered stacks
- No icon boxes, no card grids, no hero metrics — text-first information design
- Dashboard keeps the same editorial voice (Young Serif headings) instead of switching to generic app UI

---

## 2. Typography

### Font Pairing
| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display / Headings | Young Serif | 400 (only weight) | Page titles, section headings, chapter labels, stat card labels, brand name |
| Body / UI | Figtree | 400, 500, 600, 700 | Body text, nav, buttons, form labels, table content, metadata |

### CSS Variables
```css
--font-heading: 'Young Serif', Georgia, serif;
--font-body: 'Figtree', system-ui, sans-serif;
```

### Tailwind Classes
- `font-heading` — Young Serif
- `font-body` — Figtree (default on body)

### Type Scale (Marketing)
| Element | Font | Size | Notes |
|---------|------|------|-------|
| Hero headline | Young Serif | 56px / clamp(2.5rem, 5vw, 3.5rem) | Tight line-height (1.1), -0.5px letter-spacing |
| Chapter heading | Young Serif | 36px / clamp(1.75rem, 3vw, 2.25rem) | Line-height 1.15 |
| Section subheading | Young Serif | 24px | Line-height 1.3 |
| Chapter label | Figtree | 11px uppercase | Letter-spacing 3px, fire orange color |
| Body | Figtree | 16px | Line-height 1.6, max-width 65ch |
| Small / metadata | Figtree | 13px | Color: text-secondary |
| Button | Figtree | 14px, weight 600 | No uppercase (editorial buttons are sentence case) |

### Type Scale (Dashboard)
| Element | Font | Size | Notes |
|---------|------|------|-------|
| Page title | Young Serif | 24px | e.g. "Your week so far" |
| Stat label | Young Serif | 11px | Subtle serif touch on cards |
| Stat value | Figtree | 22-28px, weight 700 | Large, bold numbers |
| Table text | Figtree | 13px | Dense, functional |
| Nav items | Figtree | 13px | Weight 400 inactive, 500 active |

### Rules
- Young Serif has only weight 400 — use size and color for emphasis, never fake bold
- No uppercase on Young Serif — it's designed for sentence/title case
- Uppercase reserved for Figtree chapter labels and small metadata only
- No monospace typography anywhere (not a dev tool)

---

## 3. Color Palette

### Backgrounds (warm-tinted via OKLCH hue 45)
| Token | Value | Hex Approx | Usage |
|-------|-------|------------|-------|
| --bg-primary | oklch(0.11 0.008 45) | #0f0d0b | Page background |
| --bg-secondary | oklch(0.14 0.01 45) | #171412 | Cards, sidebar, elevated surfaces |
| --bg-tertiary | oklch(0.18 0.012 45) | #201c18 | Hover states, active items, inputs |

### Text
| Token | Value | Hex Approx | Usage |
|-------|-------|------------|-------|
| --text-primary | oklch(0.92 0.005 45) | #ece9e5 | Headings, primary text |
| --text-secondary | oklch(0.55 0.01 45) | #807a73 | Body text, descriptions, metadata |

### Accents
| Token | Value | Usage |
|-------|-------|-------|
| --accent-fire | #ff4500 | Primary CTA, chapter labels, active states, brand accent |
| --accent-ember | #ff8c00 | Hover states, secondary accent, Drake tier |
| --accent-gold | #ffd700 | Elder Dragon tier, premium highlights |

### Tier Colors
| Tier | Color | Usage |
|------|-------|-------|
| Hatchling | #c87533 (bronze) | Border-top on pricing card, tier badge |
| Drake | #ff8c00 (ember) | Border-top on pricing card, tier badge |
| Elder Dragon | #ffd700 (gold) | Border-top on pricing card, tier badge |

### Borders
| Token | Value | Hex Approx |
|-------|-------|------------|
| --border | oklch(0.25 0.008 45) | #302c27 |

### Semantic
| Token | Value |
|-------|-------|
| --success | #22c55e |
| --error | #ef4444 |
| --warning | #f59e0b |

### Color Rules
- **No gradient text** — `.fire-text` applies solid `color: var(--accent-fire)` only
- **No cyan** — removed entirely from the palette
- **No glassmorphism** — no `backdrop-filter: blur()` anywhere
- **No glow effects** — no `glow-pulse`, no `box-shadow` glow animations
- **No pure black** — always use warm-tinted `--bg-primary` (#0f0d0b)
- **Fire gradient allowed ONLY on progress bars** — `.fire-gradient` for background fills, never on text
- **Tinted neutrals** — all grays tinted toward hue 45 (amber) for warmth

---

## 4. Homepage Layout — Chapter Book

### Nav
- Solid dark background (no blur, no glassmorphism)
- Left: Young Serif "DragonMadeIt" in fire orange + dragon mascot icon
- Center: 3 Figtree text links (Features, Pricing, About)
- Right: "Sign In" text link + "See Pricing" button
- Announcement bar above nav: solid fire orange background, Figtree text

### Hero
- Full-width, vertically centered
- Massive Young Serif headline: "The faceless content engine for TikTok."
- Small Figtree subtext below (1-2 lines)
- Single primary CTA button (sentence case, no glow)
- Secondary text link ("See how it works →")
- No dashboard mockup in hero — the text IS the design
- Clean, dramatic, editorial. Maximum whitespace.

### 01 — The Problem
- Chapter label: `01 — THE PROBLEM` in 11px uppercase Figtree, fire orange, above a thin rule (`border-top: 1px solid var(--border)`)
- Split layout (asymmetric): pain-point text left (60%), comparison right (40%)
- Left: Young Serif heading "Every week you're not automating:" + bullet list of pain points
- Right: two stacked blocks — "Without DragonMadeIt" (red-tinted) and "With DragonMadeIt" (fire-tinted)
- No cards — just text blocks with subtle background tints

### 02 — How It Works
- Chapter label: `02 — HOW IT WORKS`
- Young Serif section heading
- Full-width dashboard screenshot as centerpiece (the product IS the proof)
- Below: three steps as a horizontal text row — no icons, no circles, no cards
- Each step: bold Figtree number + title, regular Figtree description
- Layout: `grid grid-cols-1 md:grid-cols-3 gap-8`

### 03 — What You Get
- Chapter label: `03 — WHAT YOU GET`
- Young Serif section heading + Figtree subtext
- Two-column text grid (no cards, no icon boxes)
- Each feature: bold Figtree title + regular description below
- Left column: 3 features. Right column: 3 features.
- Asymmetric feel — features are text, not cards

### 04 — Pricing
- Chapter label: `04 — PRICING`
- Young Serif section heading
- Billing interval toggle (Monthly / Quarterly / Annual)
- Three tier cards in a row
- Card style: solid `bg-bg-secondary`, `border-top: 3px solid {tierColor}`, no full border, no glassmorphism
- Young Serif tier name, Figtree pricing and features
- Popular badge on Drake tier

### 05 — Proof
- Chapter label: `05 — WHAT CREATORS SAY`
- Testimonials as pull quotes — large Young Serif text (24px), not in cards
- Attribution below in small Figtree: name + handle + niche
- Layout: stacked vertically or staggered, not a 3-column grid

### CTA
- Single Young Serif headline: "Your first AI video could be live tonight."
- One CTA button below
- Guarantee text in small Figtree
- Maximum whitespace, minimal elements

### Footer
- Four-column grid
- Young Serif column headings ("Product", "Company", "Legal")
- Figtree link text
- Young Serif brand name in fire orange
- Bottom: copyright + API attribution

---

## 5. Dashboard Design

### Sidebar
- Width: 200px, collapsible on mobile
- Top: Young Serif "DragonMadeIt" in fire orange (16px)
- Nav items: Figtree 13px, dot indicators (6px circles)
- Active state: fire orange dot + brighter text + subtle `bg-accent-fire/8` background
- No icons — text-only nav labels
- Bottom: tier badge + settings link

### Page Layout
- Top: Young Serif page title (24px) + Figtree date/metadata
- Content: functional grid below

### Dashboard Home (`/dashboard`)
- Young Serif heading: "Your week so far"
- Stats row: 3 cards with Young Serif labels, Figtree values
- Schedule table: upcoming posts with status badges (pill-shaped)
- Fire gradient on progress bars only

### Accounts (`/dashboard/accounts`)
- Young Serif heading: "Your accounts"
- Account cards with TikTok username, status, link action
- Add account flow

### Schedule (`/dashboard/schedule`)
- Young Serif heading: "Schedule"
- Calendar or list view of upcoming posts
- Content type, time, status

### Analytics (`/dashboard/analytics`)
- Young Serif heading: "Performance"
- Charts with fire palette (dark theme)
- Figtree data labels and values

### Settings (`/dashboard/settings`)
- Young Serif heading: "Settings"
- Form sections with Young Serif section labels
- Figtree form labels and inputs
- Billing/subscription management

### Dashboard Component Patterns
| Component | Style |
|-----------|-------|
| Cards | `bg-bg-secondary`, `border border-border`, `rounded-lg` — no glow on hover |
| Buttons | Primary: solid `bg-accent-fire`, Figtree 14px weight 600. Secondary: `border border-border` outline |
| Inputs | `bg-bg-tertiary`, `border border-border`, fire orange focus ring |
| Badges | Pill-shaped (`rounded-full`), semantic background tints (green/fire/gray at 10% opacity) |
| Tables | Figtree 13px, `border-b border-border` row separators, no zebra striping |
| Progress bars | Fire gradient background (`linear-gradient(to right, #ff8c00, #ff4500)`) — only place gradient is used |

---

## 6. Animation & Motion

### Marketing (Framer Motion)
- **Varied entrances** — no identical `translateY(20px)` on everything
  - Fade + scale for hero elements
  - Slide from left/right for split layouts (chapters)
  - Simple fade for body text
  - Staggered timing (0.08-0.12s delay per item) within groups
- **Chapter labels** — fade in with slight x-translate as user scrolls to them
- **No glow, no pulse, no infinite animations** on marketing pages
- **Hover effects** — subtle `translateY(-1px)` on buttons, border-color transitions on cards (varied per card, not identical)

### Dashboard
- **Minimal motion** — dashboard prioritizes speed
- Page transitions: simple opacity fade (200ms)
- No scroll-triggered animations in dashboard
- Loading states: skeleton shimmer (existing pattern)

---

## 7. Responsive Behavior

### Breakpoints (Tailwind defaults)
- `sm`: 640px — stack columns, reduce font sizes
- `md`: 768px — two-column layouts kick in
- `lg`: 1024px — full chapter book layouts

### Mobile Adaptations
- Hero headline: `clamp(2.5rem, 5vw, 3.5rem)` fluid sizing
- Chapter splits: stack vertically on mobile (text on top, visual below)
- Pricing cards: stack vertically, Drake card stays visually prominent
- Dashboard sidebar: collapsible hamburger menu
- Touch targets: minimum 44px on all interactive elements
- Testimonial pull quotes: reduce to 20px on mobile

---

## 8. Anti-Slop Checklist

Every implementation must pass these checks:

- [ ] No Inter font anywhere
- [ ] No gradient text (`background-clip: text` forbidden)
- [ ] No glassmorphism (`backdrop-filter: blur()` forbidden)
- [ ] No cyan (#22d3ee) anywhere
- [ ] No glow-pulse or infinite glow animations
- [ ] No identical card grids (same icon + heading + text repeated)
- [ ] No hero metrics pattern (big number + small label x3)
- [ ] No identical fade-up animations on all elements
- [ ] No pure black (#000000) — use warm-tinted bg-primary
- [ ] No icon-in-rounded-box pattern on feature cards
- [ ] Young Serif on all headings (marketing + dashboard)
- [ ] Chapter labels present and properly formatted
- [ ] Varied animation directions per section
- [ ] Testimonials are pull quotes, not cards

---

## 9. Scope

### Files to Create/Modify

**Foundation (modify):**
- `src/app/layout.tsx` — Young Serif + Figtree font imports
- `src/app/globals.css` — all CSS custom properties, utilities, chapter label styles
- `tailwind.config.ts` — font families, updated color palette

**Marketing (modify/rewrite):**
- `src/components/marketing/HomepageScene.tsx` — chapter book structure
- `src/components/marketing/HeroSection.tsx` — editorial hero
- `src/components/marketing/Navbar.tsx` — editorial nav
- `src/components/marketing/Footer.tsx` — editorial footer
- `src/components/marketing/FeaturesSection.tsx` — text grid (no cards)
- `src/components/marketing/FeatureCard.tsx` — remove or replace with text component
- `src/components/marketing/HowItWorksSection.tsx` — screenshot + text row
- `src/components/marketing/PricingSection.tsx` — chapter-styled pricing
- `src/components/marketing/PricingTierCard.tsx` — border-top accent, no glass
- `src/components/marketing/CTASection.tsx` — minimal editorial CTA
- `src/components/marketing/SocialProofSection.tsx` — inline text (already done)
- `src/components/marketing/MarketingShell.tsx` — may need layout adjustments
- `src/app/(marketing)/pricing/page.tsx` — pricing page
- `src/app/(marketing)/features/page.tsx` — features page
- `src/app/(marketing)/about/page.tsx` — about page

**Dashboard (modify):**
- `src/components/dashboard/Sidebar.tsx` — editorial sidebar
- `src/components/dashboard/StatsCard.tsx` — Young Serif labels
- `src/components/dashboard/TierBadge.tsx` — updated tier colors
- `src/components/dashboard/ContentTable.tsx` — Figtree table
- `src/components/dashboard/ScheduleCalendar.tsx` — editorial headings
- `src/components/dashboard/OnboardingChecklist.tsx` — editorial style
- `src/app/(app)/dashboard/page.tsx` — dashboard overview
- `src/app/(app)/dashboard/layout.tsx` — dashboard layout
- All dashboard sub-pages (accounts, schedule, analytics, settings)

**Auth (modify):**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`

**Shared (modify):**
- `src/components/ui/Button.tsx` — sentence case, no glow
- `src/types/index.ts` — tier colors (already done)

### Not Touched
- API routes — no backend changes
- Database schema — no migrations
- Auth logic — no NextAuth changes
- Payment logic — no Paystack changes
- `src/lib/` utilities — no changes
