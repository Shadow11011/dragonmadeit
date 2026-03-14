import { Tier, ContentStatus } from "@prisma/client";

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
  stripeCustomerId: string | null;
  onboardingComplete: boolean;
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
  videosPerWeek: number;
  schedule: PostingSchedule | null;
  scheduleLocked: boolean;
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
    description: "Perfect for getting started with TikTok automation",
    features: [
      "1 TikTok account",
      "3 videos per week",
      "Smart scheduling",
      "Content templates",
      "Email support",
    ],
    hasAnalytics: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
    hasCustomContentGen: false,
    color: "text-cyan-400",
    fireColor: "#22d3ee",
  },
  DRAKE: {
    name: "Drake",
    videosPerWeek: 7,
    monthlyPrice: 39,
    description: "Daily content for serious creators",
    features: [
      "1 TikTok account",
      "7 videos per week (daily)",
      "Smart scheduling",
      "Analytics dashboard",
      "Priority email support",
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
    description: "Maximum output with custom content generation",
    features: [
      "1 TikTok account",
      "14 videos per week (2x daily)",
      "Smart scheduling",
      "Full analytics",
      "API access",
      "Priority support",
      "Custom content generation system",
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

export { Tier, ContentStatus };
