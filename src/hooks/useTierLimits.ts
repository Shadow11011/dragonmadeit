"use client";

import { TIER_CONFIG, TierConfig, Tier } from "@/types";
import { useTypedSession } from "./useSession";

export function useTierLimits(): TierConfig & { tier: Tier } {
  const { tier } = useTypedSession();
  return { ...TIER_CONFIG[tier], tier };
}
