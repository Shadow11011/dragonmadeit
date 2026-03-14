"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { Button } from "@/components/ui/Button";

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

interface AccountSummary {
  count: number;
  totalPosts: number;
  totalViews: number;
  scheduledPosts: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<AccountSummary>({
    count: 0,
    totalPosts: 0,
    totalViews: 0,
    scheduledPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/user/accounts/count");
        if (res.ok) {
          const data: unknown = await res.json();
          const countData = data as { count: number };
          setSummary((prev) => ({ ...prev, count: countData.count }));
        }
      } catch {
        // Use default values
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/accounts">
          <Button size="sm">
            <span className="flex items-center gap-1.5">
              <PlusIcon />
              Add Account
            </span>
          </Button>
        </Link>
      </div>

      {/* Show onboarding if no accounts */}
      {!hasAccounts && <OnboardingChecklist />}

      {/* Account summary banner */}
      <div className="rounded-xl bg-bg-secondary border border-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-fire/10 text-accent-fire">
            <UserIcon />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {hasAccounts
                ? `You have ${summary.count} active TikTok account${summary.count === 1 ? "" : "s"}`
                : "No TikTok accounts yet"}
            </p>
            <p className="text-sm text-text-secondary">
              {hasAccounts
                ? "Manage your accounts and subscriptions from the TikTok Accounts page."
                : "Add your first TikTok account to start automating content."}
            </p>
          </div>
          {!hasAccounts && (
            <Link href="/dashboard/accounts" className="ml-auto shrink-0">
              <Button size="sm" variant="secondary">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="TikTok Accounts"
          value={summary.count}
          icon={<UserIcon />}
          accentColor="#ffd700"
        />
        <StatsCard
          label="Total Posts"
          value={summary.totalPosts}
          icon={<FlameIcon />}
          accentColor="#ff4500"
        />
        <StatsCard
          label="Scheduled"
          value={summary.scheduledPosts}
          icon={<CalendarIcon />}
          accentColor="#ff8c00"
        />
        <StatsCard
          label="Total Views"
          value={summary.totalViews}
          icon={<EyeIcon />}
          accentColor="#22c55e"
        />
      </div>

      {/* Quick links section */}
      {hasAccounts && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/accounts"
              className="rounded-xl bg-bg-secondary border border-border p-5 hover:border-accent-fire/30 transition-colors group"
            >
              <h3 className="font-semibold text-text-primary group-hover:text-accent-fire transition-colors">
                Manage Accounts
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                View and manage your TikTok accounts, subscriptions, and content settings.
              </p>
            </Link>
            <Link
              href="/dashboard/settings"
              className="rounded-xl bg-bg-secondary border border-border p-5 hover:border-accent-fire/30 transition-colors group"
            >
              <h3 className="font-semibold text-text-primary group-hover:text-accent-fire transition-colors">
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
