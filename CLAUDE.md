# DragonMadeIt

Three-path short-form content engine for TikTok, Instagram Reels, and YouTube Shorts: Generate (faceless AI videos from a niche), Repurpose (long-form to clips), Schedule (your-own uploads). Anchor promise is **set and leave**. Brand identity is mature SaaS, single blue accent, monochrome dragon mark. See `.impeccable.md` for the full design context.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Framer Motion (used sparingly)
- **Database:** PostgreSQL on Supabase + Prisma ORM
- **Auth:** NextAuth.js with email verification (Resend)
- **Payments:** Dodo Payments (test mode currently; live mode pending). Paystack integration was removed.
- **Posting API:** Late API (current). Migration to Post for Me planned post-launch.
- **Object storage:** MinIO today; migrating to Contabo S3-compatible Object Storage.
- **Video Pipeline:** Flux images → Edge TTS / KokoroTTS → FFmpeg → object storage
- **Workflow Engine:** n8n (self-hosted, version-controlled in `n8n/workflows/`)
- **Hosting:** Vercel (`shadow11011s-projects` scope). Staging: `dragonmadeit-redesign.vercel.app`. Production: `dragonmadeit.app`.
- **Dev Environment:** localhost on Linux

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

## Design System

Source of truth: `src/app/globals.css`. Tokens are oklch-based and tinted toward the brand hue (240°, ~0.005 chroma).

- **Accent:** `--accent` (blue 500, `#3b82f6`). Used sparingly per the 60-30-10 rule.
- **Surfaces:** `--bg-0` through `--bg-3` (oklch ladder, dark default; light mode via `[data-theme="light"]`).
- **Text:** `--text-1`, `--text-2`, `--text-3` (most → least prominent).
- **Borders:** `--border`, `--border-soft`.
- **Legacy aliases:** `--fire`, `--ember`, `--gold`, `--accent-fire`, `--accent-ember`, `--accent-gold`, `fire-text`, `fire-gradient` all alias to `--accent`. Auth and dashboard surfaces still reference these by name; do not strip them without migrating callers.
- **Fonts:** Bricolage Grotesque (heading), Source Sans 3 (body), JetBrains Mono (mono). Loaded via `next/font/google` in `src/app/layout.tsx`.
- **Dragon mark:** monochrome PNG in `public/images/brand/dragonmark-{dark,light,slate}-{32,64,256}.png`. Rendered through `<DragonMark />` and `<Sigil />`.

### Component conventions
- Cards: `.card` class — `bg-1` surface, 1px border, no decorative drop-shadow.
- Buttons: `.btn` + `.btn-primary` (filled accent) or `.btn-ghost` (outline).
- No CRT scanlines, no fantasy glyphs, no fire-gradient artwork. Marketing avoids em-dashes (Don's hard rule).

## Database Schema Conventions

- Prisma with PostgreSQL
- All models: `id` (cuid), `createdAt`, `updatedAt`
- User → Dodo: `dodoCustomerId`. TikTokAccount → `dodoSubscriptionId` (unique). Referral fields on User: `referralCode`, `referredByUserId`, `referralCredits`, `referralCreditAppliedAt`.
- Tier enum: `FREE`, `SCHEDULER`, `CREATOR`, `CLIPPER`, `STUDIO`, `STUDIO_PRO`, `AGENCY`
- TikTok accounts linked to users with Late API credentials
- Content queue: video metadata, posting schedule, status

## Dodo Payments Integration Rules

- Webhook endpoint: `/api/webhooks/dodo` — verifies via Standard Webhooks spec (`webhook-id`, `webhook-timestamp`, `webhook-signature` headers) using `client.webhooks.unwrap()`.
- Events handled: `subscription.active`, `subscription.renewed`, `subscription.on_hold`, `subscription.cancelled`, `subscription.expired`, `subscription.failed`, `payment.failed`, `payment.succeeded`.
- Idempotency: query by `dodoSubscriptionId` and `@unique` constraint, plus transactional `updateMany` with status predicate to avoid races.
- Checkout: `POST /api/dodo/checkout` initializes a hosted checkout session per tier + interval; product IDs live in `DODO_PRODUCT_IDS` (15 products: 5 paid tiers × 3 intervals).
- After checkout completes, the JWT must refresh on next request — webhook updates the DB; client picks up new tier via session refetch.

## Known Pitfalls

1. **DATABASE_URL encoding:** Special chars in PostgreSQL password must be URL-encoded or Prisma silently fails.
2. **JWT session staleness:** Refresh session after Dodo subscription changes; webhook updates the DB but the client must refetch.
3. **Prisma .env:** Reads from project root by default. Non-standard locations break `DATABASE_URL`.
4. **Marketing copy:** No em-dashes; no "industry-leading"/"revolutionize"/"unleash" buzzwords; every feature claim must map to shipped code (no fiction).

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

See `.env` for the canonical list. Required at minimum:

- `DATABASE_URL` (Supabase PostgreSQL, password URL-encoded)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `RESEND_API_KEY` (signup verification emails)
- `DODO_API_KEY`, `DODO_WEBHOOK_SECRET`, `DODO_ENV` (`test_mode` | `live_mode`)
- 15 `DODO_*_PRODUCT_ID` codes (5 paid tiers × 3 intervals)
- `LATE_API_KEY` (posting), with `POSTFORME_API_KEY` slated to replace it post-launch
