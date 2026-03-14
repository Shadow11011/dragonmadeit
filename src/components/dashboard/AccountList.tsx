"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Tier } from "@/types";

interface AccountItem {
  id: string;
  username: string;
  displayName: string | null;
}

interface AccountListProps {
  accounts: AccountItem[];
  maxAccounts: number;
  tier: Tier;
}

export function AccountList({ accounts, maxAccounts, tier }: AccountListProps) {
  const isFree = tier === "FREE";
  const atLimit = !isFree && accounts.length >= maxAccounts;
  const hasAccount = accounts.length > 0;
  const usagePercent = maxAccounts > 0
    ? Math.min((accounts.length / maxAccounts) * 100, 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Usage bar */}
      {!isFree && (
        <div className="rounded-xl bg-bg-secondary border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Account Used</span>
            <span className="text-sm font-medium">
              {accounts.length} / {maxAccounts}
            </span>
          </div>
          {maxAccounts > 0 && (
            <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
              <div
                className="h-full rounded-full fire-gradient transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Account list */}
      {accounts.length > 0 ? (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 rounded-xl bg-bg-secondary border border-border p-4 hover:border-accent-fire/30 transition-colors"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "bg-accent-fire/10 text-accent-fire font-bold text-sm"
                )}
              >
                {(account.displayName ?? account.username).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  @{account.username}
                </p>
                {account.displayName && (
                  <p className="text-sm text-text-secondary truncate">
                    {account.displayName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !isFree ? (
        <div className="rounded-xl bg-bg-secondary border border-border p-8 text-center">
          <p className="text-text-secondary mb-4">No accounts connected yet.</p>
        </div>
      ) : null}

      {/* Connect button / gate */}
      {isFree ? (
        <Link href="/dashboard/settings">
          <Button className="w-full" variant="secondary">
            Upgrade to Connect TikTok
          </Button>
        </Link>
      ) : atLimit ? (
        <Button className="w-full" disabled>
          Account Connected
        </Button>
      ) : hasAccount ? (
        <Button className="w-full" disabled>
          Account Connected
        </Button>
      ) : (
        <Button className="w-full" disabled title="TikTok integration coming soon">
          Connect TikTok Account (Coming Soon)
        </Button>
      )}
    </div>
  );
}
