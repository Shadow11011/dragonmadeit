"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DragonMascot } from "@/components/dashboard/DragonMascot";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface DailyMetric {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementTotal: number;
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  dailyMetrics: DailyMetric[];
  topPosts: Array<{
    id: string;
    content: string | null;
    views: number;
    likes: number;
    engagementRate: number;
  }>;
}

type DateRange = 7 | 30 | 90;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function getDayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

/* ------------------------------------------------------------------ */
/*  Icons                                                             */
/* ------------------------------------------------------------------ */

function BarChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="3" height="8" rx="1" fill="currentColor" />
      <rect x="7" y="6" width="3" height="12" rx="1" fill="currentColor" />
      <rect x="12" y="3" width="3" height="15" rx="1" fill="currentColor" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="13" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 17L8.55 15.7C4.4 11.9 2 9.7 2 7C2 4.8 3.8 3 6 3C7.3 3 8.5 3.6 9.3 4.5L10 5.3L10.7 4.5C11.5 3.6 12.7 3 14 3C16.2 3 18 4.8 18 7C18 9.7 15.6 11.9 11.45 15.7L10 17Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="6" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8.3 8.8L11.7 6.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.3 11.2L11.7 13.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10C2 10 5 5 10 5C15 5 18 10 18 10C18 10 15 15 10 15C5 15 2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2H3C2.44772 2 2 2.44772 2 3V11C2 11.5523 2.44772 12 3 12H11C11.5523 12 12 11.5523 12 11V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 2H12V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2L7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                  */
/* ------------------------------------------------------------------ */

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">Track your TikTok performance across all accounts.</p>
        </div>
        <div className="h-9 w-52 bg-bg-secondary rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-bg-secondary rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-bg-secondary rounded-xl animate-pulse" />
      <div className="h-48 bg-bg-secondary rounded-xl animate-pulse" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                       */
/* ------------------------------------------------------------------ */

function EmptyState({ hasAccounts }: { hasAccounts: boolean }) {
  return (
    <div className="rounded-xl bg-bg-secondary border border-border p-10 text-center">
      <div className="flex justify-center mb-4">
        <DragonMascot size={64} />
      </div>
      {hasAccounts ? (
        <>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No analytics data yet
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
            Your account is connected — metrics will appear here once your first post goes live.
          </p>
          <Link href="/dashboard/accounts">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold px-5 py-2.5 text-sm bg-gradient-to-r from-[#ff4500] to-[#ff8c00] text-white hover:brightness-110 transition-all">
              View Your Accounts
            </button>
          </Link>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No data yet — your first post will change that
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
            Add a TikTok account to start posting. Views, likes, and engagement metrics will appear here automatically.
          </p>
          <Link href="/dashboard/accounts/add">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold px-5 py-2.5 text-sm bg-gradient-to-r from-[#ff4500] to-[#ff8c00] text-white hover:brightness-110 transition-all">
              Add Your First Account
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [hasAccounts, setHasAccounts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(7);

  const fetchAnalytics = useCallback(async (days: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, countRes] = await Promise.all([
        fetch(`/api/user/analytics?days=${days}`),
        fetch("/api/user/accounts/count"),
      ]);
      if (!analyticsRes.ok) {
        throw new Error("Failed to load analytics");
      }
      const json: unknown = await analyticsRes.json();
      setData(json as AnalyticsData);
      if (countRes.ok) {
        const countJson = (await countRes.json()) as { count?: number };
        setHasAccounts((countJson.count ?? 0) > 0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics(dateRange);
  }, [dateRange, fetchAnalytics]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">Track your TikTok performance across all accounts.</p>
        </div>
        <div className="rounded-xl bg-bg-secondary border border-error/30 p-8 text-center">
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => void fetchAnalytics(dateRange)}
            className="mt-3 text-sm text-accent-fire hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isEmpty =
    !data ||
    (data.totalViews === 0 &&
      data.totalLikes === 0 &&
      data.totalShares === 0 &&
      data.dailyMetrics.length === 0);

  /* ---- Derived chart values ---- */
  const maxViews = data
    ? Math.max(...data.dailyMetrics.map((d) => d.views), 1)
    : 1;
  const maxEngagement = data
    ? Math.max(...data.dailyMetrics.map((d) => d.engagementTotal), 1)
    : 1;

  const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
    { label: "7 days", value: 7 },
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">Track your TikTok performance across all accounts.</p>
        </div>

        <div className="flex rounded-lg bg-bg-secondary border border-border overflow-hidden">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === opt.value
                  ? "bg-accent-fire text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <EmptyState hasAccounts={hasAccounts} />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Total Views"
              value={formatNumber(data!.totalViews)}
              icon={<BarChartIcon />}
              accentColor="#ff4500"
            />
            <StatsCard
              label="Engagement Rate"
              value={`${data!.avgEngagementRate.toFixed(1)}%`}
              icon={<PercentIcon />}
              accentColor="#ff8c00"
            />
            <StatsCard
              label="Total Likes"
              value={formatNumber(data!.totalLikes)}
              icon={<HeartIcon />}
              accentColor="#ffd700"
            />
            <StatsCard
              label="Total Shares"
              value={formatNumber(data!.totalShares)}
              icon={<ShareIcon />}
              accentColor="#22c55e"
            />
          </div>

          {/* Bar chart — Views */}
          {data!.dailyMetrics.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                Views ({dateRange === 7 ? "This Week" : `Last ${dateRange} Days`})
              </h2>
              <div className="rounded-xl bg-bg-secondary border border-border p-6">
                <div className="flex items-end justify-between gap-3 h-48">
                  {data!.dailyMetrics.map((metric) => {
                    const heightPercent = (metric.views / maxViews) * 100;
                    return (
                      <div
                        key={metric.date}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="w-full flex justify-center">
                          <div
                            className="w-full max-w-[40px] rounded-t-md fire-gradient transition-all duration-700"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary">
                          {getDayLabel(metric.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Engagement by Day */}
          {data!.dailyMetrics.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Engagement by Day</h2>
              <div className="rounded-xl bg-bg-secondary border border-border p-6">
                <div className="space-y-3">
                  {data!.dailyMetrics.map((metric) => {
                    const widthPercent =
                      (metric.engagementTotal / maxEngagement) * 100;
                    return (
                      <div
                        key={metric.date}
                        className="flex items-center gap-3"
                      >
                        <span className="text-xs text-text-secondary w-8">
                          {getDayLabel(metric.date)}
                        </span>
                        <div className="flex-1 h-3 rounded-full bg-bg-tertiary overflow-hidden">
                          <div
                            className="h-full rounded-full fire-gradient transition-all duration-700"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-10 text-right">
                          {formatNumber(metric.engagementTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Top Performing Posts */}
          {data!.topPosts.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Top Performing Posts</h2>
              <div className="space-y-3">
                {data!.topPosts.map((post, index) => (
                  <div
                    key={post.id || index}
                    className="rounded-xl bg-bg-secondary border border-border p-4 hover:border-accent-fire/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-fire/10 text-accent-fire text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary leading-relaxed">
                            {post.content
                              ? post.content.length > 80
                                ? post.content.slice(0, 80) + "..."
                                : post.content
                              : "Untitled post"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <EyeIcon />
                              {formatNumber(post.views)} views
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartIcon />
                              {formatNumber(post.likes)} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <PercentIcon />
                              {post.engagementRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {post.id && (
                        <a
                          href={`https://www.tiktok.com/@/video/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 items-center gap-1 text-xs text-accent-fire hover:text-accent-ember transition-colors mt-0.5"
                          title="View on TikTok"
                        >
                          <ExternalLinkIcon />
                          <span className="hidden sm:inline">View</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
