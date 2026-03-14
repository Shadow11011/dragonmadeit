"use client";

import { useEffect, useState } from "react";
import { AccountList } from "@/components/dashboard/AccountList";
import { useTypedSession } from "@/hooks/useSession";
import type { TikTokAccountInfo } from "@/types";

export default function AccountsPage() {
  const { hasActiveSubscription, isLoading: sessionLoading } = useTypedSession();
  const [accounts, setAccounts] = useState<TikTokAccountInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;

    async function fetchAccounts() {
      try {
        const res = await fetch("/api/tiktok-accounts");
        const data: unknown = await res.json();
        const responseData = data as { success: boolean; data?: TikTokAccountInfo[] };
        if (responseData.success && responseData.data) {
          setAccounts(responseData.data);
        }
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, [sessionLoading]);

  if (sessionLoading || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">TikTok Accounts</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-bg-secondary rounded-xl" />
          <div className="h-24 bg-bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">TikTok Accounts</h1>

      <div className="rounded-xl bg-bg-secondary border border-border p-4">
        <p className="text-sm text-text-secondary">
          {accounts.length === 0 ? (
            <>Purchase a plan to get your first TikTok account slot, then link your TikTok username.</>
          ) : (
            <>
              You have{" "}
              <span className="font-medium text-text-primary">{accounts.length}</span>{" "}
              account{accounts.length !== 1 ? "s" : ""}. Each account has its own tier and posting schedule.
            </>
          )}
        </p>
      </div>

      <AccountList accounts={accounts} hasActiveSubscription={hasActiveSubscription} />
    </div>
  );
}
