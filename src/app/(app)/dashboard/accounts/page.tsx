"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AccountList, TikTokAccountItem } from "@/components/dashboard/AccountList";
import { Button } from "@/components/ui/Button";

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<TikTokAccountItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tiktok-accounts");
      const data: unknown = await res.json();

      if (!res.ok) {
        const errData = data as { error?: string };
        throw new Error(errData.error ?? "Failed to fetch accounts");
      }

      const result = data as { accounts: TikTokAccountItem[] };
      setAccounts(result.accounts);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch accounts";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">TikTok Accounts</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your TikTok accounts and automation subscriptions.
          </p>
        </div>
        <Link href="/dashboard/accounts/add">
          <Button className="fire-gradient text-white glow-fire whitespace-nowrap" size="md">
            <span className="mr-2">+</span>
            Add New Account
          </Button>
        </Link>
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success"
          >
            Payment successful! Your new TikTok account subscription is active.
            Don&apos;t forget to link your TikTok username.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={() => void fetchAccounts()}>
            Retry
          </Button>
        </div>
      )}

      {/* Account summary */}
      {!isLoading && !error && accounts.length > 0 && (
        <div className="rounded-xl bg-bg-secondary border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              Active subscriptions
            </span>
            <span className="text-sm font-medium">
              {accounts.filter((a) => a.status === "active").length} active
              {accounts.filter((a) => a.status === "pending").length > 0 && (
                <span className="text-warning ml-2">
                  ({accounts.filter((a) => a.status === "pending").length} pending)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Account list */}
      <AccountList accounts={accounts} isLoading={isLoading} />
    </div>
  );
}
