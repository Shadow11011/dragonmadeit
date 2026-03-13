# DragonMadeIt

TikTok automation SaaS. "Set it and forget it" content automation with a dark dragon aesthetic. The marketing site is an immersive 3D experience. The app dashboard is clean, fast, and functional with subtle dragon-themed accents.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **3D Engine:** React Three Fiber (R3F) + @react-three/drei + @react-three/postprocessing
- **Styling:** Tailwind CSS + Framer Motion (page transitions and micro-interactions)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **Payments:** Stripe (subscriptions + webhooks)
- **TikTok Integration:** Late API
- **Video Pipeline:** Flux images → Edge TTS / KokoroTTS → FFmpeg → MinIO storage
- **Workflow Engine:** n8n (self-hosted, manages automation pipelines)
- **Process Manager:** PM2 (production)
- **Reverse Proxy:** Nginx + Certbot SSL (production)
- **Dev Environment:** localhost on Linux

## Two Zones: Marketing vs App

The site has two distinct zones with different rendering strategies:

### Zone 1: Marketing Site (3D Immersive)
- Routes: `/`, `/pricing`, `/features`, `/about`
- Full React Three Fiber 3D scenes
- Heavy visual effects: bloom, particles, scroll-driven animations
- Dragon model as centerpiece
- Designed to impress and convert visitors
- Lazy-load all 3D assets — show a dark loading screen with the dragon logo while scene loads
- Mobile fallback: simplified scene or static dark gradient with 2D parallax for low-end devices

### Zone 2: App Dashboard (Clean 2D + Accents)
- Routes: `/dashboard`, `/dashboard/*`
- No R3F Canvas — zero WebGL overhead
- Dark theme matching the marketing brand palette
- Subtle dragon accents: small animated dragon icon in sidebar, fire-gradient progress bars, ember particle CSS background (pure CSS, not Three.js)
- Focus: speed, clarity, usability
- Must work perfectly on mobile Chrome and mid-range Android devices

## Subscription Tiers

| Tier | Name | Target | Visual Theme |
|------|------|--------|--------------|
| 1 | Hatchling | Entry — 1 TikTok account, basic scheduling | Small egg/baby dragon motif, cool blue-green fire |
| 2 | Drake | Mid — multi-account, advanced scheduling, analytics | Medium dragon, orange-amber fire |
| 3 | Elder Dragon | Premium — unlimited accounts, priority, API access | Full dragon, intense red-gold fire, most visual effects |

On the pricing page, each tier is presented as a 3D scene element — the dragon evolves as the tier increases.

## Project Structure

```
dragonmadeit/
├── .claude/
│   └── skills/
│       └── skill-maker/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Marketing route group (3D pages)
│   │   │   ├── page.tsx         # Landing page with 3D hero
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   └── layout.tsx       # Marketing layout (includes R3F Canvas provider)
│   │   ├── (app)/               # Dashboard route group (2D pages)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx     # Main dashboard
│   │   │   │   ├── accounts/    # TikTok account management
│   │   │   │   ├── schedule/    # Posting schedule
│   │   │   │   ├── analytics/   # Performance metrics
│   │   │   │   ├── settings/    # Account & billing
│   │   │   │   └── layout.tsx   # Dashboard layout (sidebar, no R3F)
│   │   │   └── layout.tsx       # App layout (auth guard, dark theme)
│   │   ├── api/
│   │   │   ├── auth/            # NextAuth routes
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/      # Stripe webhook handler
│   │   │   ├── tiktok/          # Late API integration
│   │   │   └── user/            # User management endpoints
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── three/               # All R3F/Three.js components (marketing only)
│   │   │   ├── DragonScene.tsx  # Main 3D dragon scene
│   │   │   ├── FireParticles.tsx
│   │   │   ├── FloatingTierCards.tsx
│   │   │   ├── ScrollCamera.tsx
│   │   │   └── Environment.tsx
│   │   ├── marketing/           # 2D marketing components (nav, footer, CTA)
│   │   ├── dashboard/           # Dashboard UI components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── AccountList.tsx
│   │   │   ├── ScheduleCalendar.tsx
│   │   │   └── DragonMascot.tsx # Small animated dragon accent
│   │   └── ui/                  # Shared primitives (buttons, inputs, modals)
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── stripe.ts            # Stripe helpers
│   │   ├── auth.ts              # NextAuth config
│   │   ├── late-api.ts          # Late API wrapper
│   │   └── utils.ts
│   ├── hooks/
│   └── types/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── models/                  # 3D model files (.glb/.gltf)
│   ├── textures/                # 3D textures, HDR environment maps
│   └── images/                  # Static images, logos, favicons
├── .env
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 3D Technical Guidelines

### React Three Fiber Rules
- All R3F components live in `src/components/three/` — never mix into dashboard pages
- The `<Canvas>` element is ONLY in the marketing layout, never in the dashboard layout
- Use `@react-three/drei` helpers: `useGLTF` for models, `useScroll` for scroll animations, `Float` for hover effects, `Text3D` for typography, `Environment` for lighting
- Use `@react-three/postprocessing` for bloom, vignette, chromatic aberration (fire glow effects)
- Dragon model format: `.glb` (compressed glTF) — keep under 5MB
- Always wrap 3D components in `Suspense` with a branded fallback
- Use `useFrame` sparingly — every callback runs at 60fps

### Performance Rules
- Lazy-load 3D scenes with `next/dynamic` and `{ ssr: false }` — R3F cannot server-render
- Show branded loading screen (dark bg + dragon logo + loading bar) while assets load
- Detect mobile/low-end devices → serve simplified scene (fewer particles, lower poly, no postprocessing)
- Use `drei`'s `PerformanceMonitor` to auto-degrade if FPS drops below 30
- Target: 60fps desktop, 30fps minimum mobile, graceful degradation below
- Compress textures with KTX2 for GPU-accelerated loading
- Total 3D asset budget for landing page: under 10MB

### The Dragon Model
- Format: .glb with separate meshes for body, wings, fire breath (independent animation)
- Rigged for: idle breathing, wing spread, fire burst
- LOD: high-poly desktop, low-poly swap for mobile

### Scroll-Driven Landing Page Flow
1. **Hero:** Dark void → dragon emerges from darkness with particle fire, title fades in
2. **Features:** Camera orbits dragon. Feature cards appear alongside as user scrolls
3. **Pricing:** Dragon transforms through three forms (Hatchling egg → Drake → Elder Dragon)
4. **CTA:** Dragon lands, fire settles, "Start Automating" button with glow pulse
5. **Footer:** Embers floating upward, minimal links

## Dashboard Design System

### Color Palette
```
--bg-primary: #0a0a0f          (near-black, blue undertone)
--bg-secondary: #12121a        (dark card backgrounds)
--bg-tertiary: #1a1a2e         (hover states, active items)
--accent-fire: #ff4500          (primary action, dragon fire orange-red)
--accent-ember: #ff8c00         (secondary accent, warm amber)
--accent-gold: #ffd700          (premium highlights, Elder Dragon tier)
--text-primary: #e4e4e7         (main text, off-white)
--text-secondary: #71717a       (muted text)
--border: #27272a               (subtle borders)
--success: #22c55e
--error: #ef4444
--warning: #f59e0b
```

### Dashboard Components
- Cards: `bg-secondary` with subtle `border`, faint `accent-fire` border glow on hover
- Buttons: primary = `accent-fire` gradient, secondary = outline
- Progress bars: fire gradient (ember → fire → gold)
- Charts: dark theme with fire palette
- Dragon mascot: small animated SVG/Lottie in sidebar header, subtle idle animation

## Database Schema Conventions

- Prisma with PostgreSQL
- All models: `id` (cuid), `createdAt`, `updatedAt`
- User → Stripe: `stripeCustomerId`, `stripeSubscriptionId`
- Tier enum: `FREE`, `HATCHLING`, `DRAKE`, `ELDER_DRAGON`
- TikTok accounts linked to users with Late API credentials
- Content queue: video metadata, posting schedule, status

## Stripe Integration Rules

- Webhook endpoint: `/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- **CRITICAL BUG FIX:** After payment confirmation, ALWAYS refresh the user's session/JWT to reflect new tier. Previous build had JWT staleness bug — customers showed free tier UI despite active subscription.
- Always use `stripe.webhooks.constructEvent()` for verification

## Known Pitfalls

1. **DATABASE_URL encoding:** Special chars in PostgreSQL password must be URL-encoded or Prisma silently fails.
2. **JWT session staleness:** Invalidate/refresh JWT after Stripe subscription changes.
3. **Nginx reverse proxy:** Include WebSocket upgrade headers for HMR. Set proper `proxy_pass` with `Host` forwarding.
4. **Prisma .env:** Reads from project root by default. Non-standard locations break `DATABASE_URL`.
5. **R3F + SSR:** React Three Fiber cannot server-render. Always use `next/dynamic` with `{ ssr: false }` for Canvas components. Forgetting this causes hydration crashes.

## Commands

- `pnpm dev` — Dev server
- `pnpm build` — Production build
- `npx prisma migrate dev` — Run migrations
- `npx prisma generate` — Regenerate client
- `npx prisma studio` — Database GUI

## Code Conventions

- TypeScript strict — no `any`, use `unknown` + type guards
- Server components default, client only when needed (3D, interactivity)
- All R3F components: `"use client"` directive required
- API routes: Route Handlers in `app/api/`
- Error handling: try/catch, proper status codes, never swallow errors
- Env vars: validate at startup, fail fast
- Imports: `@/` path alias for `src/`

## Build Order for Features

1. Determine zone (marketing 3D or dashboard 2D)
2. Prisma schema change → migration (if needed)
3. API route
4. UI component (correct directory)
5. End-to-end test
6. Error + loading states
7. For 3D: test desktop and mobile viewports

## Git Conventions

- Branches: `feat/`, `fix/`, `refactor/`
- Commits: conventional (`feat: add 3D dragon hero scene`)
- Push to `main` (solo dev for now)

## Available Skills

- `/skill-maker` — Create new Claude Code skills on demand

## Key Dependencies

```json
{
  "next": "^14",
  "react": "^18",
  "@react-three/fiber": "^8",
  "@react-three/drei": "^9",
  "@react-three/postprocessing": "^2",
  "three": "^0.160",
  "@prisma/client": "^5",
  "next-auth": "^4",
  "stripe": "^14",
  "tailwindcss": "^3",
  "framer-motion": "^11"
}
```

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/dragonmadeit
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
LATE_API_KEY=
```
