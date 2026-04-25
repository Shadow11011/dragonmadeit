"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { DragonMascot } from "@/components/dashboard/DragonMascot";
import { ReferralWidget } from "@/components/dashboard/ReferralWidget";
import { Button } from "@/components/ui/Button";
import { useTypedSession } from "@/hooks/useSession";
import { getNextPostTime } from "@/lib/schedule-utils";
import type { TikTokAccountInfo } from "@/types";

function formatCountdownMs(ms: number): string {
  if (ms <= 0) return "any moment";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  if (minutes > 0) return `in ${minutes}m`;
  return "any second now";
}

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2C10 2 6 6 6 10C6 12.2 7.8 14 10 14C12.2 14 14 12.2 14 10C14 6 10 2 10 2ZM10 12C8.9 12 8 11.1 8 10C8 8.5 10 5.5 10 5.5C10 5.5 12 8.5 12 10C12 11.1 11.1 12 10 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 17C4 13.7 6.7 11 10 11C13.3 11 16 13.7 16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10C2 10 5 5 10 5C15 5 18 10 18 10C18 10 15 15 10 15C5 15 2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName: string | null | undefined): string | null {
  if (!fullName) return null;
  const trimmed = fullName.trim();
  if (!trimmed) return null;
  return trimmed.split(" ")[0];
}

interface AccountSummary {
  count: number;
  totalPosts: number;
  processing: number;
  scheduledPosts: number;
  hasFreeAccount: boolean;
  hasPaidAccount: boolean;
}

interface AnalyticsResponse {
  accounts: Array<{
    stats: {
      posted: number;
      scheduled: number;
      processing: number;
      failed: number;
    };
  }>;
}

interface AccountsListResponse {
  data?: TikTokAccountInfo[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function DashboardPage() {
  const { user } = useTypedSession();
  const [summary, setSummary] = useState<AccountSummary>({
    count: 0,
    totalPosts: 0,
    processing: 0,
    scheduledPosts: 0,
    hasFreeAccount: false,
    hasPaidAccount: false,
  });
  const [accountsList, setAccountsList] = useState<TikTokAccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const firstName = getFirstName(user?.name);

  useEffect(() => {
    async function fetchData() {
      try {
        const [countRes, analyticsRes, accountsRes] = await Promise.all([
          fetch("/api/user/accounts/count"),
          fetch("/api/user/analytics?days=30"),
          fetch("/api/user/accounts"),
        ]);

        if (countRes.ok) {
          const countJson: unknown = await countRes.json();
          const countData = countJson as { count: number };
          setSummary((prev) => ({ ...prev, count: countData.count }));
        }

        if (accountsRes.ok) {
          const accountsJson = (await accountsRes.json()) as AccountsListResponse;
          const list = accountsJson.data ?? [];
          setAccountsList(list);
          setSummary((prev) => ({
            ...prev,
            hasFreeAccount: list.some((a) => a.tier === "FREE"),
            hasPaidAccount: list.some((a) => a.tier !== "FREE"),
          }));
        }

        if (analyticsRes.ok) {
          const analyticsJson: unknown = await analyticsRes.json();
          const analyticsData = analyticsJson as AnalyticsResponse;
          const totals = (analyticsData.accounts ?? []).reduce(
            (acc, a) => ({
              posted: acc.posted + (a.stats?.posted ?? 0),
              scheduled: acc.scheduled + (a.stats?.scheduled ?? 0),
              processing: acc.processing + (a.stats?.processing ?? 0),
            }),
            { posted: 0, scheduled: 0, processing: 0 },
          );
          setSummary((prev) => ({
            ...prev,
            totalPosts: totals.posted,
            scheduledPosts: totals.scheduled,
            processing: totals.processing,
          }));
        }
      } catch {
        // Use default values
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  const hasAccounts = summary.count > 0;

  // First-run: the user has created an account but TikTok isn't linked yet.
  // The Orchestrator won't pick it up until `lateAccountId` gets set by the
  // /link flow, so surface the missing step before anything else.
  const pendingAccount = useMemo(
    () =>
      accountsList.find((a) =>
        (a.username ?? "").startsWith("pending-")
      ) ?? null,
    [accountsList],
  );

  // Compute the earliest upcoming post across all linked accounts so the
  // dashboard can answer "when's my next one?" at a glance.
  const nextPost = useMemo(() => {
    let best: { date: Date; account: TikTokAccountInfo } | null = null;
    for (const a of accountsList) {
      if ((a.username ?? "").startsWith("pending-")) continue;
      if (!a.schedule) continue;
      const d = getNextPostTime(a.schedule);
      if (!d) continue;
      if (!best || d < best.date) best = { date: d, account: a };
    }
    return best;
  }, [accountsList]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (!nextPost) return;
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [nextPost]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-bg-secondary rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-bg-secondary rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-text-primary">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {hasAccounts
              ? "Here\u2019s how your content is performing."
              : "Let\u2019s get your first TikTok account set up."}
          </p>
        </div>
        {hasAccounts && (
          <Link href="/dashboard/accounts">
            <Button size="sm">
              <span className="flex items-center gap-1.5">
                <PlusIcon />
                Add Account
              </span>
            </Button>
          </Link>
        )}
      </div>

      {/* Empty state with DragonMascot when no accounts */}
      {!hasAccounts && (
        <div className="rounded-xl bg-bg-secondary border border-border p-10 text-center">
          <div className="flex justify-center mb-4">
            <DragonMascot size={64} />
          </div>
          <h2 className="font-heading text-xl text-text-primary mb-2">
            Your first video is 5 minutes away
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
            Pick a tier, choose your content style, and we handle the rest. Automated TikTok content, posted on schedule.
          </p>
          <Link href="/dashboard/accounts/add">
            <Button size="md">Add your first account</Button>
          </Link>
        </div>
      )}

      {/* Show onboarding checklist if no accounts */}
      {!hasAccounts && <OnboardingChecklist />}

      {/* Phase E — first-run: pending account needs TikTok connect */}
      {pendingAccount && (
        <div className="rounded-xl border border-accent-fire/40 bg-accent-fire/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-fire/15 text-accent-fire">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3v10M4 9l6-6 6 6M5 17h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-lg text-text-primary">
                One step left &mdash; connect your TikTok
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Your account is set up, but posting can&rsquo;t start until you
                link your TikTok account. Takes 30 seconds.
              </p>
            </div>
            <Link href={`/dashboard/accounts/${pendingAccount.id}`}>
              <Button className="fire-gradient text-white whitespace-nowrap" size="md">
                Connect TikTok
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Phase D — status hero: next post + recent posts at a glance */}
      {hasAccounts && !pendingAccount && (
        <div className="rounded-xl bg-bg-secondary border border-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">
                Status
              </p>
              {nextPost ? (
                <>
                  <h2 className="font-heading text-2xl text-text-primary">
                    Next post {formatCountdownMs(nextPost.date.getTime() - nowMs)}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {nextPost.date.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {nextPost.date.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {summary.totalPosts > 0 && (
                      <>
                        {" "}
                        &middot; {summary.totalPosts} post
                        {summary.totalPosts === 1 ? "" : "s"} in the last 30 days
                      </>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-2xl text-text-primary">
                    No posts queued
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    No upcoming posts scheduled. Open your account to set a
                    schedule.
                  </p>
                </>
              )}
            </div>
            <div className="h-14 w-14 rounded-full border-4 border-accent-fire/20 flex items-center justify-center shrink-0">
              <div className="h-9 w-9 rounded-full fire-gradient opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Free-tier upgrade banner — shown when user has a FREE account and no paid account yet */}
      {hasAccounts && summary.hasFreeAccount && !summary.hasPaidAccount && (
        <div className="rounded-xl border border-accent-gold/30 bg-gradient-to-r from-accent-gold/10 via-accent-fire/5 to-transparent p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-gold/15 text-accent-gold">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L12.5 7L18 8L14 12L15 17L10 14.5L5 17L6 12L2 8L7.5 7L10 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-base text-text-primary">
                You&apos;re on the free plan
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                1 video/week · gameplay only · watermarked. Upgrade to remove the watermark,
                unlock all 66 content niches, and post up to 14× per week.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/pricing">
                <Button size="sm" variant="secondary">
                  Compare plans
                </Button>
              </Link>
              <Link href="/dashboard/accounts/add">
                <Button size="sm">
                  Upgrade now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Account summary banner — only when user has accounts */}
      {hasAccounts && (
        <div className="rounded-xl bg-bg-secondary border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-fire/10 text-accent-fire">
              <UserIcon />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {`You have ${summary.count} active TikTok account${summary.count === 1 ? "" : "s"}`}
              </p>
              <p className="text-sm text-text-secondary">
                Manage your accounts and subscriptions from the TikTok Accounts page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="TikTok Accounts"
          value={formatNumber(summary.count)}
          icon={<UserIcon />}
          accentColor="#ffd700"
        />
        <StatsCard
          label="Total Posts"
          value={formatNumber(summary.totalPosts)}
          icon={<FlameIcon />}
          accentColor="#ff4500"
        />
        <StatsCard
          label="Scheduled"
          value={formatNumber(summary.scheduledPosts)}
          icon={<CalendarIcon />}
          accentColor="#ff8c00"
        />
        <StatsCard
          label="Processing"
          value={formatNumber(summary.processing)}
          icon={<EyeIcon />}
          accentColor="#22c55e"
        />
      </div>

      {/* Referral widget — bottom of the at-a-glance area. Shown for any
          signed-in user since every user has a shareable code from day one. */}
      <ReferralWidget />

      {/* Quick links section */}
      {hasAccounts && (
        <section>
          <h2 className="font-heading text-xl mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/accounts"
              className="rounded-xl bg-bg-secondary border border-border p-5 transition-colors group"
            >
              <h3 className="font-semibold text-text-primary transition-colors">
                Manage Accounts
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                View and manage your TikTok accounts, subscriptions, and content settings.
              </p>
            </Link>
            <Link
              href="/dashboard/settings"
              className="rounded-xl bg-bg-secondary border border-border p-5 transition-colors group"
            >
              <h3 className="font-semibold text-text-primary transition-colors">
                Account Settings
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Update your profile, manage billing, and configure preferences.
              </p>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
