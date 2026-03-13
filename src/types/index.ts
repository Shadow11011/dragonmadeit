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
  tier: Tier;
  stripeCustomerId: string | null;
}

export interface TierConfig {
  name: string;
  maxAccounts: number;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  color: string;
  fireColor: string;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  FREE: {
    name: "Free",
    maxAccounts: 0,
    hasAnalytics: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
    color: "text-text-secondary",
    fireColor: "#71717a",
  },
  HATCHLING: {
    name: "Hatchling",
    maxAccounts: 1,
    hasAnalytics: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
    color: "text-cyan-400",
    fireColor: "#22d3ee",
  },
  DRAKE: {
    name: "Drake",
    maxAccounts: 5,
    hasAnalytics: true,
    hasApiAccess: false,
    hasPrioritySupport: false,
    color: "text-accent-ember",
    fireColor: "#ff8c00",
  },
  ELDER_DRAGON: {
    name: "Elder Dragon",
    maxAccounts: -1, // unlimited
    hasAnalytics: true,
    hasApiAccess: true,
    hasPrioritySupport: true,
    color: "text-accent-gold",
    fireColor: "#ffd700",
  },
};

export { Tier, ContentStatus };
