"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContentTable } from "@/components/dashboard/ContentTable";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { useTypedSession } from "@/hooks/useSession";

const MOCK_CONTENT_ITEMS = [
  {
    id: "c1",
    title: "Morning routine productivity hack",
    status: "POSTED",
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
  {
    id: "c2",
    title: "Quick editing tutorial for beginners",
    status: "SCHEDULED",
    scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
  {
    id: "c3",
    title: "Behind the scenes: Content creation setup",
    status: "PROCESSING",
    scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "flamecreator",
  },
  {
    id: "c4",
    title: "Top 5 trending sounds this week",
    status: "DRAFT",
    scheduledAt: null,
    tiktokAccountUsername: undefined,
  },
  {
    id: "c5",
    title: "Engagement strategy breakdown",
    status: "FAILED",
    scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "flamecreator",
  },
];

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

function CheckoutSuccessHandler() {
  const searchParams = useSearchParams();
  const { tier, update } = useTypedSession();
  const [settling, setSettling] = useState(false);
  const isCheckoutSuccess = searchParams.get("checkout") === "success";

  const refreshSession = useCallback(async () => {
    await update();
  }, [update]);

  useEffect(() => {
    if (!isCheckoutSuccess) return;
    if (tier !== "FREE") {
      setSettling(false);
      return;
    }

    setSettling(true);
    // Webhook may still be in-flight — retry after a delay
    const timer = setTimeout(() => {
      refreshSession();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isCheckoutSuccess, tier, refreshSession]);

  if (!isCheckoutSuccess || !settling) return null;

  return (
    <div className="rounded-xl bg-accent-fire/10 border border-accent-fire/20 p-4 mb-6 text-center">
      <p className="text-sm text-text-primary animate-pulse">
        Setting up your account... This may take a moment.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { onboardingComplete, tier } = useTypedSession();
  const isPaid = tier !== "FREE";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <CheckoutSuccessHandler />

      {isPaid && !onboardingComplete && <OnboardingChecklist />}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Posts"
          value={24}
          icon={<FlameIcon />}
          trend={{ value: 12, isPositive: true }}
          accentColor="#ff4500"
        />
        <StatsCard
          label="Scheduled"
          value={8}
          icon={<CalendarIcon />}
          accentColor="#ff8c00"
        />
        <StatsCard
          label="Accounts"
          value={1}
          icon={<UserIcon />}
          accentColor="#ffd700"
        />
        <StatsCard
          label="Views"
          value="1.2K"
          icon={<EyeIcon />}
          trend={{ value: 8, isPositive: true }}
          accentColor="#22c55e"
        />
      </div>

      {/* Recent Content */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
        <ContentTable items={MOCK_CONTENT_ITEMS} />
      </section>
    </div>
  );
}
