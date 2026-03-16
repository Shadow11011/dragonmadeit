"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";
import { ContentTable } from "@/components/dashboard/ContentTable";
import { DragonMascot } from "@/components/dashboard/DragonMascot";
import { normalizeSchedule, getNextPostTime, formatCountdown } from "@/lib/schedule-utils";
import type { TikTokAccountInfo, PostingSchedule } from "@/types";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContentItemFromApi {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduledAt: string | null;
  postedAt: string | null;
  tiktokPostId: string | null;
  tiktokAccountUsername: string | null;
  createdAt: string;
}

interface ContentApiResponse {
  success: boolean;
  data?: {
    items: ContentItemFromApi[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

interface AccountsApiResponse {
  success: boolean;
  data?: TikTokAccountInfo[];
  error?: string;
}

interface NextPostInfo {
  date: Date;
  username: string;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function ScheduleSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Schedule</h1>
        <p className="text-text-secondary text-sm mt-1">Your upcoming posts across all accounts.</p>
      </div>
      {/* Countdown skeleton */}
      <div className="h-24 bg-bg-secondary rounded-xl animate-pulse" />
      {/* Calendar skeleton */}
      <div>
        <div className="h-5 w-32 bg-bg-secondary rounded animate-pulse mb-3" />
        <div className="h-48 bg-bg-secondary rounded-xl animate-pulse" />
      </div>
      {/* Table skeleton */}
      <div>
        <div className="h-5 w-40 bg-bg-secondary rounded animate-pulse mb-3" />
        <div className="h-64 bg-bg-secondary rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function SchedulePage() {
  const [contentItems, setContentItems] = useState<ContentItemFromApi[]>([]);
  const [accounts, setAccounts] = useState<TikTokAccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contentRes, accountsRes] = await Promise.all([
        fetch("/api/user/content?page=1&limit=50"),
        fetch("/api/tiktok-accounts"),
      ]);

      if (!contentRes.ok || !accountsRes.ok) {
        throw new Error("Failed to load schedule data");
      }

      const contentJson = (await contentRes.json()) as ContentApiResponse;
      const accountsJson = (await accountsRes.json()) as AccountsApiResponse;

      if (!contentJson.success || !contentJson.data) {
        throw new Error(contentJson.error ?? "Failed to load content");
      }
      if (!accountsJson.success || !accountsJson.data) {
        throw new Error(accountsJson.error ?? "Failed to load accounts");
      }

      setContentItems(contentJson.data.items);
      setAccounts(accountsJson.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  /* ---- Compute nearest next post ---- */
  const nextPost = useMemo<NextPostInfo | null>(() => {
    let soonest: NextPostInfo | null = null;

    for (const account of accounts) {
      if (!account.schedule) continue;
      const normalized = normalizeSchedule(account.schedule as PostingSchedule);
      const nextTime = getNextPostTime(normalized);
      if (!nextTime) continue;

      if (!soonest || nextTime.getTime() < soonest.date.getTime()) {
        soonest = { date: nextTime, username: account.username };
      }
    }

    return soonest;
  }, [accounts]);

  /* ---- Countdown timer ---- */
  useEffect(() => {
    if (!nextPost) return;

    function updateCountdown() {
      if (!nextPost) return;
      setCountdownText(formatCountdown(nextPost.date));
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 60_000);
    return () => clearInterval(interval);
  }, [nextPost]);

  /* ---- Map API items to component props ---- */
  const calendarItems = useMemo(
    () =>
      contentItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        scheduledAt: item.scheduledAt,
      })),
    [contentItems]
  );

  const tableItems = useMemo(
    () =>
      contentItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        scheduledAt: item.scheduledAt,
        tiktokAccountUsername: item.tiktokAccountUsername ?? undefined,
        tiktokPostId: item.tiktokPostId ?? undefined,
      })),
    [contentItems]
  );

  /* ---- Render ---- */

  if (loading) {
    return <ScheduleSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Schedule</h1>
          <p className="text-text-secondary text-sm mt-1">Your upcoming posts across all accounts.</p>
        </div>
        <div className="rounded-xl bg-bg-secondary border border-error/30 p-8 text-center">
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => void fetchData()}
            className="mt-3 text-sm text-accent-fire hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Schedule</h1>
        <p className="text-text-secondary text-sm mt-1">Your upcoming posts across all accounts.</p>
      </div>

      {/* Next Video Countdown */}
      {hasAccounts && nextPost ? (
        <div className="rounded-xl bg-bg-secondary border border-accent-fire/20 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-fire/10 text-accent-fire">
              <ClockIcon />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-text-secondary">Next video posts in</p>
              <p className="text-2xl font-bold text-text-primary">{countdownText}</p>
              <p className="text-sm text-text-secondary mt-0.5">
                @{nextPost.username}
              </p>
            </div>
          </div>
        </div>
      ) : hasAccounts ? (
        <div className="rounded-xl bg-bg-secondary border border-border p-10 text-center">
          <div className="flex justify-center mb-4">
            <DragonMascot size={64} />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No upcoming posts yet
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
            Your account is connected — posts will appear here once your automation starts running.
          </p>
          <Link href="/dashboard/accounts">
            <Button
              size="md"
              className="bg-gradient-to-r from-[#ff4500] to-[#ff8c00] text-white hover:brightness-110"
            >
              View Your Accounts
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-secondary border border-border p-10 text-center">
          <div className="flex justify-center mb-4">
            <DragonMascot size={64} />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Nothing scheduled yet
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
            Add your first TikTok account to start posting on autopilot.
          </p>
          <Link href="/dashboard/accounts/add">
            <Button
              size="md"
              className="bg-gradient-to-r from-[#ff4500] to-[#ff8c00] text-white hover:brightness-110"
            >
              <span className="flex items-center gap-1.5">
                <PlusIcon />
                Add Account
              </span>
            </Button>
          </Link>
        </div>
      )}

      {/* Week Overview */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Week Overview</h2>
        <ScheduleCalendar items={calendarItems} />
      </section>

      {/* Content Table */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Upcoming Content</h2>
        <ContentTable items={tableItems} />
      </section>
    </div>
  );
}
