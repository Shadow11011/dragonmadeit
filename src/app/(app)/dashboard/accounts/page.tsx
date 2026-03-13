"use client";

import { AccountList } from "@/components/dashboard/AccountList";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { useTierLimits } from "@/hooks/useTierLimits";

const MOCK_ACCOUNTS = [
  { id: "acc1", username: "dragonscale_tips", displayName: "Dragon Scale Tips" },
  { id: "acc2", username: "flamecreator", displayName: "Flame Creator" },
];

export default function AccountsPage() {
  const { tier, maxAccounts } = useTierLimits();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">TikTok Accounts</h1>
        <TierBadge tier={tier} />
      </div>

      <div className="rounded-xl bg-bg-secondary border border-border p-4">
        <p className="text-sm text-text-secondary">
          Your <span className="font-medium text-text-primary">{tier === "ELDER_DRAGON" ? "Elder Dragon" : tier.charAt(0) + tier.slice(1).toLowerCase()}</span> plan
          allows{" "}
          <span className="font-medium text-text-primary">
            {maxAccounts === -1 ? "unlimited" : maxAccounts}
          </span>{" "}
          TikTok {maxAccounts === 1 ? "account" : "accounts"}.
        </p>
      </div>

      <AccountList accounts={MOCK_ACCOUNTS} maxAccounts={maxAccounts} />
    </div>
  );
}
