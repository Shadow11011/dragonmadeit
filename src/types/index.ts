import { Tier, ContentStatus, VideoType, VoiceType, BillingInterval } from "@prisma/client";

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  accountCount: number;
  totalViews: number;
  postsThisWeek: number;
  failedPosts: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  paystackCustomerCode: string | null;
}

export type PaidTier = Exclude<Tier, "FREE">;
/** Tiers with a self-serve Paystack plan. AGENCY is custom-billed (not self-serve). */
export type SelfServePaidTier = Exclude<Tier, "FREE" | "AGENCY">;

/** Schedule for a TikTok account's posting times */
export interface PostingSchedule {
  /** Days of the week to post (0 = Sunday, 6 = Saturday) */
  days: number[];
  /** Preferred posting times in HH:MM format (24h) */
  times: string[];
  /** Timezone identifier e.g. "America/New_York" */
  timezone: string;
}

export interface TikTokAccountInfo {
  id: string;
  username: string;
  displayName: string | null;
  tier: Tier;
  billingInterval: BillingInterval;
  videosPerWeek: number;
  schedule: PostingSchedule | null;
  scheduleLocked: boolean;
  videoType: "GAMEPLAY" | "AI_IMAGES";
  voiceType: "MALE" | "FEMALE" | "RANDOM";
  storyTypes: string[];
  randomizeStories: boolean;
  lateProfileId: string | null;
  lateAccountId: string | null;
  isLinked: boolean;
  createdAt: string;
}

/**
 * Mode-Based TierConfig. Each tier maps to one or more of three pillars:
 *
 *   - Generate: AI-produced videos (gameplay / AI images)
 *   - Clip: repurpose existing long-form content into short clips
 *   - Schedule Uploads: schedule the user's own pre-made content
 *
 * A quota of 0 means the pillar is locked for that tier. All tiers share
 * Analytics as a surface feature (gated by `hasAnalytics` on paid plans).
 */
export interface TierConfig {
  name: string;
  tierKey: Tier;
  /** Monthly price in USD. "custom" for AGENCY. */
  priceUSD: number | "custom";
  /** One-line positioning description. Short, no em-dashes. */
  description: string;
  // Per-pillar capability booleans
  canGenerate: boolean;
  canClip: boolean;
  canScheduleUploads: boolean;
  // Per-pillar monthly quotas. 0 = pillar locked.
  generateQuotaPerMonth: number;
  clipsQuotaPerMonth: number;
  scheduleUploadsPerMonth: number;
  /** Max linked social accounts. Agency is "custom" - we use 0 to signal contact-us. */
  maxAccounts: number;
  /** Surface feature strings rendered in pricing cards and wizards. */
  features: string[];
  hasAnalytics: boolean;
  color: string;
  fireColor: string;
  /**
   * Legacy per-week generation cadence. Preserved for scheduling UIs that
   * still drive the weekly cadence picker. Derived as roughly
   * `generateQuotaPerMonth / 4`, rounded to a schedule-friendly integer.
   * 0 for tiers that can't generate.
   */
  videosPerWeek: number;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  FREE: {
    name: "Free",
    tierKey: "FREE",
    priceUSD: 0,
    description: "Sample every pillar. Watermarked output, no card required.",
    canGenerate: true,
    canClip: true,
    canScheduleUploads: true,
    generateQuotaPerMonth: 2,
    clipsQuotaPerMonth: 1,
    scheduleUploadsPerMonth: 3,
    maxAccounts: 1,
    features: [
      "2 AI-generated videos per month (watermarked)",
      "1 clip per month (watermarked)",
      "3 scheduled uploads per month",
      "1 linked social account",
      "No credit card required",
    ],
    hasAnalytics: false,
    color: "text-text-secondary",
    fireColor: "#71717a",
    videosPerWeek: 1,
  },
  SCHEDULER: {
    name: "Scheduler",
    tierKey: "SCHEDULER",
    priceUSD: 12,
    description: "Bring your own content. Schedule and publish on autopilot.",
    canGenerate: false,
    canClip: false,
    canScheduleUploads: true,
    generateQuotaPerMonth: 0,
    clipsQuotaPerMonth: 0,
    scheduleUploadsPerMonth: 100,
    maxAccounts: 2,
    features: [
      "100 scheduled uploads per month",
      "2 linked social accounts",
      "Bulk CSV upload",
      "Monthly calendar view",
      "Basic analytics",
    ],
    hasAnalytics: true,
    color: "text-[#4fb0c6]",
    fireColor: "#4fb0c6",
    videosPerWeek: 0,
  },
  CREATOR: {
    name: "Creator",
    tierKey: "CREATOR",
    priceUSD: 19,
    description: "Fully automated AI video generation. Posted for you.",
    canGenerate: true,
    canClip: false,
    canScheduleUploads: false,
    generateQuotaPerMonth: 20,
    clipsQuotaPerMonth: 0,
    scheduleUploadsPerMonth: 0,
    maxAccounts: 2,
    features: [
      "20 AI-generated videos per month",
      "2 linked social accounts",
      "All 66 content niches",
      "AI scripts and voiceover",
      "Basic analytics",
    ],
    hasAnalytics: true,
    color: "text-[#c87533]",
    fireColor: "#c87533",
    videosPerWeek: 5,
  },
  CLIPPER: {
    name: "Clipper",
    tierKey: "CLIPPER",
    priceUSD: 19,
    description: "Turn long-form content into short clips, automatically.",
    canGenerate: false,
    canClip: true,
    canScheduleUploads: false,
    generateQuotaPerMonth: 0,
    clipsQuotaPerMonth: 20,
    scheduleUploadsPerMonth: 0,
    maxAccounts: 2,
    features: [
      "20 clips per month",
      "2 linked social accounts",
      "Auto-detected viral moments",
      "Vertical reformat for TikTok and Shorts",
      "Basic analytics",
    ],
    hasAnalytics: true,
    color: "text-[#ff8c00]",
    fireColor: "#ff8c00",
    videosPerWeek: 0,
  },
  STUDIO: {
    name: "Studio",
    tierKey: "STUDIO",
    priceUSD: 45,
    description: "All three pillars. Generate, clip, and schedule from one place.",
    canGenerate: true,
    canClip: true,
    canScheduleUploads: true,
    generateQuotaPerMonth: 40,
    clipsQuotaPerMonth: 40,
    scheduleUploadsPerMonth: 250,
    maxAccounts: 5,
    features: [
      "40 AI-generated videos per month",
      "40 clips per month",
      "250 scheduled uploads per month",
      "5 linked social accounts",
      "Full analytics dashboard",
      "Bulk CSV upload",
    ],
    hasAnalytics: true,
    color: "text-accent-ember",
    fireColor: "#ff6a00",
    videosPerWeek: 10,
  },
  STUDIO_PRO: {
    name: "Studio Pro",
    tierKey: "STUDIO_PRO",
    priceUSD: 79,
    description: "Business volume across every pillar.",
    canGenerate: true,
    canClip: true,
    canScheduleUploads: true,
    generateQuotaPerMonth: 100,
    clipsQuotaPerMonth: 100,
    scheduleUploadsPerMonth: 700,
    maxAccounts: 10,
    features: [
      "100 AI-generated videos per month",
      "100 clips per month",
      "700 scheduled uploads per month",
      "10 linked social accounts",
      "Full analytics dashboard",
      "Bulk CSV upload",
      "Priority support",
    ],
    hasAnalytics: true,
    color: "text-accent-gold",
    fireColor: "#ffd700",
    videosPerWeek: 25,
  },
  AGENCY: {
    name: "Agency",
    tierKey: "AGENCY",
    priceUSD: "custom",
    description: "Custom volume and 30+ accounts. Talk to us.",
    canGenerate: true,
    canClip: true,
    canScheduleUploads: true,
    generateQuotaPerMonth: 0,
    clipsQuotaPerMonth: 0,
    scheduleUploadsPerMonth: 0,
    maxAccounts: 0,
    features: [
      "Custom AI generation volume",
      "Custom clip volume",
      "Custom scheduling volume",
      "30+ linked social accounts",
      "Dedicated onboarding",
      "Priority support",
    ],
    hasAnalytics: true,
    color: "text-accent-gold",
    fireColor: "#ffd700",
    videosPerWeek: 0,
  },
};

export const BILLING_DISCOUNTS = {
  quarterly: 0.15,
  annual: 0.30,
} as const;

export type Currency = "NGN" | "USD";

/**
 * Monthly base prices per self-serve paid tier in both currencies.
 * NGN values are USD × 1500 (approx.), rounded to clean figures. Don can
 * retune these once the Paystack plans are created. AGENCY is custom-billed
 * and deliberately excluded.
 */
export const TIER_PRICES: Record<SelfServePaidTier, Record<Currency, number>> = {
  SCHEDULER: { NGN: 18000, USD: 12 },
  CREATOR: { NGN: 29000, USD: 19 },
  CLIPPER: { NGN: 29000, USD: 19 },
  STUDIO: { NGN: 68000, USD: 45 },
  STUDIO_PRO: { NGN: 120000, USD: 79 },
};

/** Get the price for a tier + interval + currency */
export function getTierPrice(
  tier: SelfServePaidTier,
  interval: BillingInterval,
  currency: Currency
): number {
  const monthly = TIER_PRICES[tier][currency];
  switch (interval) {
    case "MONTHLY":
      return monthly;
    case "QUARTERLY":
      return Math.round(monthly * 3 * (1 - BILLING_DISCOUNTS.quarterly));
    case "ANNUAL":
      return Math.round(monthly * 12 * (1 - BILLING_DISCOUNTS.annual));
  }
}

/** Get the effective monthly price for display */
export function getEffectiveMonthlyPrice(
  tier: SelfServePaidTier,
  interval: BillingInterval,
  currency: Currency
): number {
  const total = getTierPrice(tier, interval, currency);
  const months = interval === "MONTHLY" ? 1 : interval === "QUARTERLY" ? 3 : 12;
  return Math.round(total / months);
}

/** Format a price with currency symbol */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
}

export type GenderRestriction = "any" | "male_only" | "female_only";

export interface StoryTypeConfig {
  id: string;
  name: string;
  emoji: string;
  genderRestriction: GenderRestriction;
  description: string;
}

export interface ContentConfig {
  videoType: "GAMEPLAY" | "AI_IMAGES";
  voiceType: "MALE" | "FEMALE" | "RANDOM";
  storyTypes: string[];
  randomizeStories: boolean;
}

export { Tier, ContentStatus, VideoType, VoiceType, BillingInterval };
