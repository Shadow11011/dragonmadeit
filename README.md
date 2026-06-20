# DragonMadeIt

A short-form content SaaS that takes a brand from idea to posted video without manual editing. Users configure a brand once, and the platform generates faceless short-form videos, repurposes long-form footage into clips, and schedules everything to TikTok, Reels, and Shorts.

Live: https://dragonmadeit.app

## What it does

DragonMadeIt is built around three content paths:

- **Generate.** Pick a niche, tone, and brand voice. The system writes a script, narrates it with text to speech, generates matching visuals, composes the video with captions, and queues it for posting.
- **Repurpose.** Drop in a long YouTube video. It is transcribed, the strongest segments are detected, reformatted to 9:16, captioned, and turned into multiple clips.
- **Schedule.** Upload finished videos, manage connected accounts, and batch-schedule posts on a calendar.

## Tech stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Database:** PostgreSQL via Prisma ORM (hosted on Supabase, with row-level security)
- **Auth:** NextAuth.js with credentials and session middleware
- **Payments:** Paystack (NGN) and Dodo Payments (international), with webhook verification and tiered subscriptions
- **Media:** MinIO (S3-compatible) object storage for video assets with automatic retention cleanup
- **Email:** Resend for transactional mail
- **Automation:** background pipeline that polls the queue, routes jobs, generates media, and posts on schedule

## Architecture

The app is a Next.js monolith for the product surface (marketing, auth, dashboard, billing) backed by Postgres through Prisma. Long-running media jobs are decoupled from request handling: the web app enqueues work, and a separate pipeline picks jobs up, generates assets, writes them to object storage, and posts to the connected platforms. Subscription tiers gate features and enforce quotas.

## Data model

Prisma schema covering users, subscriptions, connected social accounts, brands, content jobs, and the posting queue, with the relations and indexes needed to drive quota enforcement and scheduling.

## Status

Production SaaS with live billing. This repository holds the application code; infrastructure, pipeline workers, and secrets are configured separately and are not part of this repo.

## License

Proprietary. All rights reserved.
