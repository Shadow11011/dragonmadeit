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

export interface TierConfig {
  name: string;
  videosPerWeek: number;
  monthlyPrice: number;
  description: string;
  features: string[];
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  hasCustomContentGen: boolean;
  color: string;
  fireColor: string;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  FREE: {
    name: "Free",
    videosPerWeek: 0,
    monthlyPrice: 0,
    description: "Sign up and explore the platform",
    features: [],
    hasAnalytics: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
    hasCustomContentGen: false,
    color: "text-text-secondary",
    fireColor: "#71717a",
  },
  HATCHLING: {
    name: "Hatchling",
    videosPerWeek: 3,
    monthlyPrice: 15,
    description: "Test the waters. 3 videos/week, fully automated.",
    features: [
      "3 AI-generated videos/week",
      "Auto-posted to TikTok",
      "66 content styles",
      "Basic analytics",
    ],
    hasAnalytics: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
    hasCustomContentGen: false,
    color: "text-[#c87533]",
    fireColor: "#c87533",
  },
  DRAKE: {
    name: "Drake",
    videosPerWeek: 7,
    monthlyPrice: 39,
    description: "Post every day. The algorithm rewards consistency — this tier delivers it.",
    features: [
      "7 AI-generated videos/week (daily)",
      "Everything in Hatchling",
      "Full analytics dashboard",
      "Priority support",
    ],
    hasAnalytics: true,
    hasApiAccess: false,
    hasPrioritySupport: false,
    hasCustomContentGen: false,
    color: "text-accent-ember",
    fireColor: "#ff8c00",
  },
  ELDER_DRAGON: {
    name: "Elder Dragon",
    videosPerWeek: 14,
    monthlyPrice: 129,
    description: "Dominate your niche. 2 videos/day plus custom content tuning.",
    features: [
      "14 AI-generated videos/week (2x daily)",
      "Everything in Drake",
      "Custom content generation",
      "API access",
      "Dedicated support",
    ],
    hasAnalytics: true,
    hasApiAccess: true,
    hasPrioritySupport: true,
    hasCustomContentGen: true,
    color: "text-accent-gold",
    fireColor: "#ffd700",
  },
};

export const BILLING_DISCOUNTS = {
  quarterly: 0.15,
  annual: 0.30,
} as const;

export type Currency = "NGN" | "USD";

/** Monthly base prices per tier in both currencies */
export const TIER_PRICES: Record<PaidTier, Record<Currency, number>> = {
  HATCHLING: { NGN: 23000, USD: 15 },
  DRAKE: { NGN: 60000, USD: 39 },
  ELDER_DRAGON: { NGN: 200000, USD: 129 },
};

/** Get the price for a tier + interval + currency */
export function getTierPrice(
  tier: PaidTier,
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
  tier: PaidTier,
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
