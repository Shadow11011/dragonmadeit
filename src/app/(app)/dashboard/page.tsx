"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { DragonMascot } from "@/components/dashboard/DragonMascot";
import { Button } from "@/components/ui/Button";
import { useTypedSession } from "@/hooks/useSession";

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
  });
  const [loading, setLoading] = useState(true);
  const firstName = getFirstName(user?.name);

  useEffect(() => {
    async function fetchData() {
      try {
        const [countRes, analyticsRes] = await Promise.all([
          fetch("/api/user/accounts/count"),
          fetch("/api/user/analytics?days=30"),
        ]);

        if (countRes.ok) {
          const countJson: unknown = await countRes.json();
          const countData = countJson as { count: number };
          setSummary((prev) => ({ ...prev, count: countData.count }));
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
