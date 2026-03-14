import { TIER_CONFIG, TierConfig, Tier } from "@/types";

/**
 * Returns the tier config for a given tier.
 * In the multi-account model, tiers are per TikTok account,
 * not per user. Pass the account's tier to get its config.
 */
export function getTierConfig(tier: Tier): TierConfig {
  return TIER_CONFIG[tier];
}
