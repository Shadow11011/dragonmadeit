"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AccountList, TikTokAccountItem } from "@/components/dashboard/AccountList";
import { Button } from "@/components/ui/Button";
import { useTypedSession } from "@/hooks/useSession";
import type { TikTokAccountInfo, PostingSchedule } from "@/types";
import { normalizeSchedule } from "@/lib/schedule-utils";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

interface AccountApiResponse {
  success: boolean;
  data: (TikTokAccountInfo & {
    videoType?: string;
    voiceType?: string;
    storyTypes?: string[];
    randomizeStories?: boolean;
  })[];
  error?: string;
}

function mapScheduleDays(schedule: PostingSchedule | null): string[] {
  const normalized = normalizeSchedule(schedule);
  if (!normalized) return [];
  return normalized.days.map((d) => DAY_NAMES[d] ?? "");
}

function mapScheduleTime(schedule: PostingSchedule | null): string {
  const normalized = normalizeSchedule(schedule);
  if (!normalized) return "";
  return normalized.times[0];
}

function deriveStatus(account: TikTokAccountInfo): "active" | "pending" | "cancelled" {
  if (!account.isLinked) return "pending";
  return "active";
}

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const { update } = useTypedSession();
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

      const result = data as AccountApiResponse;
      const accountsData = Array.isArray(result.data) ? result.data : [];
      const mapped: TikTokAccountItem[] = accountsData.map((acct) => ({
        id: acct.id,
        username: acct.username,
        displayName: acct.displayName,
        tier: acct.tier,
        status: deriveStatus(acct),
        scheduleDays: mapScheduleDays(acct.schedule),
        scheduleTime: mapScheduleTime(acct.schedule),
        schedule: acct.schedule,
        videoType: acct.videoType ?? "GAMEPLAY",
        voiceType: acct.voiceType ?? "RANDOM",
        storyTypes: Array.isArray(acct.storyTypes) ? acct.storyTypes : [],
        randomizeStories: acct.randomizeStories ?? true,
      }));
      setAccounts(mapped);
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

  // After checkout, refresh accounts (Dodo webhook creates the account)
  const isCheckoutSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    if (isCheckoutSuccess) {
      // Poll briefly for webhook to create the account
      const timer = setTimeout(() => void fetchAccounts(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCheckoutSuccess, fetchAccounts]);

  useEffect(() => {
    if (searchParams.get("checkout") === "success" || searchParams.get("linked") === "true") {
      setShowSuccess(true);
      // Refresh JWT so session reflects new tier immediately
      if (searchParams.get("checkout") === "success") {
        void update();
      }
      // Auto-dismiss linked banner after 6s, keep checkout CTA visible
      if (searchParams.get("linked") === "true") {
        const timer = setTimeout(() => setShowSuccess(false), 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, update]);

  const hasFreeAccount = accounts.some((a) => a.tier === "FREE");
  const hasPaidAccount = accounts.some((a) => a.tier !== "FREE");
  // Free tier is capped at one channel, period. The "Add another" button only
  // makes sense for users who have already paid for at least one subscription.
  const isFreeOnly = hasFreeAccount && !hasPaidAccount;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">TikTok Accounts</h1>
          <p className="text-text-secondary text-sm mt-1">
            {isFreeOnly
              ? "Your free dragon runs one TikTok channel. Upgrade anytime to add more."
              : "Manage your TikTok accounts. Each account runs on its own subscription and schedule."}
          </p>
        </div>
        {isFreeOnly ? (
          <Link href="/pricing">
            <Button variant="secondary" size="md" className="whitespace-nowrap">
              <span className="mr-2">★</span>
              Upgrade to add channels
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/accounts/add">
            <Button className="fire-gradient text-white glow-fire whitespace-nowrap" size="md">
              <span className="mr-2">+</span>
              Add New Account
            </Button>
          </Link>
        )}
      </div>

      {/* FREE-only upgrade nudge */}
      {isFreeOnly && !isLoading && (
        <div className="rounded-xl border border-accent-fire/30 bg-accent-fire/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">
                You&rsquo;re on the free tier &mdash; one channel
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Free DragonMadeIt is limited to a single TikTok channel, one post a week,
                and a light watermark. Upgrade to add more channels, post daily, and drop
                the watermark.
              </p>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="fire-gradient text-white whitespace-nowrap">
                See plans
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Linked success banner */}
      <AnimatePresence>
        {showSuccess && searchParams.get("linked") === "true" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success"
          >
            TikTok connected! Your dragon is now posting on autopilot.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-payment CTA */}
      <AnimatePresence>
        {showSuccess && isCheckoutSuccess && (() => {
          const pendingAccount = accounts.find((a) => a.status === "pending");
          return (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border-2 border-accent-fire/40 bg-accent-fire/5 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Payment successful!
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {pendingAccount
                      ? "Connect your TikTok account to start automated posting."
                      : "Setting up your account\u2026 this usually takes a few seconds."}
                  </p>
                </div>
                {pendingAccount ? (
                  <Link href={`/dashboard/accounts/${pendingAccount.id}`}>
                    <Button className="fire-gradient text-white glow-fire whitespace-nowrap" size="md">
                      Connect TikTok
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-accent-fire text-sm">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Waiting...</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
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
