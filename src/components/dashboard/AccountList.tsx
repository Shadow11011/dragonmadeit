"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TierBadge } from "@/components/dashboard/TierBadge";
import type { TikTokAccountInfo } from "@/types";

interface AccountListProps {
  accounts: TikTokAccountInfo[];
  hasActiveSubscription: boolean;
}

export function AccountList({ accounts, hasActiveSubscription }: AccountListProps) {
  return (
    <div className="space-y-4">
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
                  account.isLinked
                    ? "bg-accent-fire/10 text-accent-fire font-bold text-sm"
                    : "bg-warning/10 text-warning font-bold text-sm"
                )}
              >
                {account.isLinked
                  ? (account.displayName ?? account.username).charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {account.isLinked ? `@${account.username}` : "Pending Link"}
                  </p>
                  <TierBadge tier={account.tier} />
                </div>
                <p className="text-sm text-text-secondary">
                  {account.videosPerWeek} videos/week
                  {!account.isLinked && (
                    <span className="ml-2 text-warning">
                      — Link your TikTok to start posting
                    </span>
                  )}
                </p>
              </div>
              {!account.isLinked && (
                <Link href={`/dashboard/accounts/${account.id}/link`}>
                  <Button size="sm" variant="secondary">
                    Link Account
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-bg-secondary border border-border p-8 text-center">
          <p className="text-text-secondary mb-4">No TikTok accounts yet.</p>
        </div>
      )}

      {/* Add account CTA */}
      <Link href="/dashboard/settings">
        <Button className="w-full" variant={hasActiveSubscription ? "secondary" : "primary"}>
          {hasActiveSubscription
            ? "Add Another Account"
            : "Get Started — Purchase a Plan"}
        </Button>
      </Link>
    </div>
  );
}
