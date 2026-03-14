"use client";

import { useTypedSession } from "./useSession";

/**
 * In the new per-account model, tiers are on TikTokAccount, not User.
 * This hook provides user-level subscription status for UI gating.
 * For account-specific tier info, fetch from /api/tiktok-accounts.
 */
export function useSubscriptionStatus() {
  const { hasActiveSubscription, isLoading } = useTypedSession();
  return { hasActiveSubscription, isLoading };
}
