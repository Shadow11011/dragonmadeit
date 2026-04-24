# DragonMadeIt

TikTok automation SaaS. "Set it and forget it" content automation with a dark dragon aesthetic. The marketing site uses Framer Motion animations. The app dashboard is clean, fast, and functional with subtle dragon-themed accents.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Framer Motion (page transitions and micro-interactions)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **Payments:** Paystack (subscriptions + webhooks)
- **TikTok Integration:** Late API
- **Video Pipeline:** Flux images -> Edge TTS / KokoroTTS -> FFmpeg -> MinIO storage
- **Workflow Engine:** n8n (self-hosted, manages automation pipelines)
- **Process Manager:** PM2 (production)
- **Reverse Proxy:** Nginx + Certbot SSL (production)
- **Dev Environment:** localhost on Linux
- **Domain:** https://dragonmadeit.app
- **Vercel URL:** https://dragonmadeit.vercel.app

## Two Zones: Marketing vs App

The site has two distinct zones:

### Zone 1: Marketing Site
- Routes: `/`, `/pricing`, `/features`, `/about`, `/terms`, `/privacy`
- Framer Motion scroll-driven animations
- Dark dragon aesthetic throughout
- Designed to impress and convert visitors

### Zone 2: App Dashboard
- Routes: `/dashboard`, `/dashboard/*`
- Dark theme matching the marketing brand palette
- Subtle dragon accents: small animated dragon icon in sidebar, fire-gradient progress bars, ember particle CSS background
- Focus: speed, clarity, usability
- Must work perfectly on mobile Chrome and mid-range Android devices

## Subscription Tiers (Mode-Based)

| Tier | Prisma enum | Price | Generate | Clipper | Scheduler | Max accts |
|------|-------------|-------|----------|---------|-----------|-----------|
| Free | FREE | $0 | 2 watermarked | 1 watermarked | 3 | 1 |
| Scheduler | SCHEDULER | $12 | 0 | 0 | 100 | 2 |
| Creator | CREATOR | $19 | 20 | 0 | 0 | 2 |
| Clipper | CLIPPER | $19 | 0 | 20 | 0 | 2 |
| Studio | STUDIO | $45 | 40 | 40 | 250 | 5 |
| Studio Pro | STUDIO_PRO | $79 | 100 | 100 | 700 | 10 |
| Agency | AGENCY | custom | custom | custom | custom | 30+ |

Billing discounts: 15% quarterly, 30% annual. Each $19 tier does ONE pillar; Studio bundles all three; Agency is custom (not self-serve). Source of truth for quotas + capabilities: `src/types/index.ts` (`TIER_CONFIG`).

## Project Structure

```
dragonmadeit/
├── .claude/
│   └── skills/
│       └── skill-maker/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Marketing route group
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   ├── about/
│   │   │   ├── terms/
│   │   │   ├── privacy/
│   │   │   └── layout.tsx       # Marketing layout
│   │   ├── (auth)/              # Auth pages (login, signup)
│   │   ├── (app)/               # Dashboard route group
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx     # Main dashboard
│   │   │   │   ├── accounts/    # TikTok account management
│   │   │   │   ├── schedule/    # Posting schedule
│   │   │   │   ├── analytics/   # Performance metrics
│   │   │   │   ├── settings/    # Account & billing
│   │   │   │   └── layout.tsx   # Dashboard layout (sidebar)
│   │   │   └── layout.tsx       # App layout (auth guard, dark theme)
│   │   ├── api/
│   │   │   ├── auth/            # NextAuth routes
│   │   │   ├── webhooks/
│   │   │   │   ├── paystack/    # Paystack webhook handler
│   │   │   │   └── late/        # Late API webhook handler
│   │   │   ├── tiktok-accounts/ # TikTok account endpoints
│   │   │   ├── paystack/        # Payment initialization & verification
│   │   │   ├── geo/             # Geolocation
│   │   │   └── user/            # User management endpoints
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── marketing/           # Marketing components (nav, footer, CTA, sections)
│   │   ├── dashboard/           # Dashboard UI components
│   │   ├── providers/           # SessionProvider, MotionProvider
│   │   └── ui/                  # Shared primitives (Button, Skeleton)
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── paystack.ts          # Paystack helpers
│   │   ├── auth.ts              # NextAuth config
│   │   ├── late-api.ts          # Late API wrapper
│   │   ├── email.ts             # Resend email
│   │   ├── schedule-utils.ts    # Scheduling helpers
│   │   ├── content-config.ts    # Content configuration
│   │   ├── geo.ts               # Geolocation
│   │   ├── rate-limit.ts        # Rate limiting
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useTierLimits.ts
│   │   ├── useSession.ts
│   │   └── useMediaQuery.ts
│   └── types/
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/                  # Static images, logos, favicons
├── marketing/                   # Marketing agent docs
├── .env
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

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
- Progress bars: fire gradient (ember -> fire -> gold)
- Charts: dark theme with fire palette
- Dragon mascot: small animated SVG/Lottie in sidebar header, subtle idle animation

## Database Schema Conventions

- Prisma with PostgreSQL
- All models: `id` (cuid), `createdAt`, `updatedAt`
- User -> Paystack: `paystackCustomerCode`, TikTokAccount -> `paystackSubscriptionCode`, `paystackEmailToken`
- Tier enum: `FREE`, `SCHEDULER`, `CREATOR`, `CLIPPER`, `STUDIO`, `STUDIO_PRO`, `AGENCY`
- TikTok accounts linked to users with Late API credentials
- Content queue: video metadata, posting schedule, status

## Paystack Integration Rules

- Webhook endpoint: `/api/webhooks/paystack`
- Events: `charge.success`, `subscription.create`, `subscription.disable`, `invoice.payment_failed`
- Webhook verification: HMAC-SHA512 of raw body using `PAYSTACK_SECRET_KEY`, compared against `x-paystack-signature` header
- **CRITICAL BUG FIX:** After payment confirmation, ALWAYS refresh the user's session/JWT to reflect new tier. Previous build had JWT staleness bug -- customers showed free tier UI despite active subscription.
- **paystackEmailToken:** Must be stored from `subscription.create` webhook -- required to cancel subscriptions via API. If missing, subscription cannot be cancelled programmatically.
- No billing portal -- Paystack has no equivalent to Stripe's Customer Portal. Cancel is per-account via the dashboard.

## Known Pitfalls

1. **DATABASE_URL encoding:** Special chars in PostgreSQL password must be URL-encoded or Prisma silently fails.
2. **JWT session staleness:** Invalidate/refresh JWT after Paystack subscription changes.
3. **Nginx reverse proxy:** Include WebSocket upgrade headers for HMR. Set proper `proxy_pass` with `Host` forwarding.
4. **Prisma .env:** Reads from project root by default. Non-standard locations break `DATABASE_URL`.

## Commands

- `pnpm dev` -- Dev server
- `pnpm build` -- Production build
- `npx prisma migrate dev` -- Run migrations
- `npx prisma generate` -- Regenerate client
- `npx prisma studio` -- Database GUI

## Code Conventions

- TypeScript strict -- no `any`, use `unknown` + type guards
- Server components default, client only when needed (interactivity)
- API routes: Route Handlers in `app/api/`
- Error handling: try/catch, proper status codes, never swallow errors
- Env vars: validate at startup, fail fast
- Imports: `@/` path alias for `src/`

## Build Order for Features

1. Determine zone (marketing or dashboard)
2. Prisma schema change -> migration (if needed)
3. API route
4. UI component (correct directory)
5. End-to-end test
6. Error + loading states

## Git Conventions

- Branches: `feat/`, `fix/`, `refactor/`
- Commits: conventional (`feat: add pricing page`)
- Push to `main` (solo dev for now)

## Agent Delegation Rule

When a task touches 3+ files or requires parallel workstreams, delegate to subagents using the Agent tool. Split by zone (marketing vs dashboard) and layer (schema -> API -> UI). Each agent should own a coherent slice of work and report back. The main thread coordinates, reviews, and resolves cross-cutting concerns. Never have two agents editing the same file.

## Available Skills

- `/skill-maker` -- Create new Claude Code skills on demand

## Key Dependencies

```json
{
  "next": "^14",
  "react": "^18",
  "@prisma/client": "^5",
  "next-auth": "^4",
  "tailwindcss": "^3",
  "framer-motion": "^11"
}
```

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/dragonmadeit
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SCHEDULER_MONTHLY_PLAN_CODE=
PAYSTACK_SCHEDULER_QUARTERLY_PLAN_CODE=
PAYSTACK_SCHEDULER_ANNUAL_PLAN_CODE=
PAYSTACK_CREATOR_MONTHLY_PLAN_CODE=
PAYSTACK_CREATOR_QUARTERLY_PLAN_CODE=
PAYSTACK_CREATOR_ANNUAL_PLAN_CODE=
PAYSTACK_CLIPPER_MONTHLY_PLAN_CODE=
PAYSTACK_CLIPPER_QUARTERLY_PLAN_CODE=
PAYSTACK_CLIPPER_ANNUAL_PLAN_CODE=
PAYSTACK_STUDIO_MONTHLY_PLAN_CODE=
PAYSTACK_STUDIO_QUARTERLY_PLAN_CODE=
PAYSTACK_STUDIO_ANNUAL_PLAN_CODE=
PAYSTACK_STUDIO_PRO_MONTHLY_PLAN_CODE=
PAYSTACK_STUDIO_PRO_QUARTERLY_PLAN_CODE=
PAYSTACK_STUDIO_PRO_ANNUAL_PLAN_CODE=
LATE_API_KEY=
```
