"use client";

import { AccountList } from "@/components/dashboard/AccountList";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { useTierLimits } from "@/hooks/useTierLimits";
import { TIER_CONFIG } from "@/types";

const MOCK_ACCOUNTS = [
  { id: "acc1", username: "dragonscale_tips", displayName: "Dragon Scale Tips" },
];

export default function AccountsPage() {
  const { tier, maxAccounts, videosPerWeek } = useTierLimits();
  const config = TIER_CONFIG[tier];
  const isFree = tier === "FREE";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">TikTok Accounts</h1>
        <TierBadge tier={tier} />
      </div>

      <div className="rounded-xl bg-bg-secondary border border-border p-4">
        <p className="text-sm text-text-secondary">
          {isFree ? (
            <>Upgrade to a paid plan to connect your TikTok account and start automating.</>
          ) : (
            <>
              Your <span className="font-medium text-text-primary">{config.name}</span> plan
              allows{" "}
              <span className="font-medium text-text-primary">{maxAccounts}</span>{" "}
              TikTok account with{" "}
              <span className="font-medium text-text-primary">{videosPerWeek} videos per week</span>.
            </>
          )}
        </p>
      </div>

      <AccountList accounts={isFree ? [] : MOCK_ACCOUNTS} maxAccounts={maxAccounts} tier={tier} />
    </div>
  );
}
