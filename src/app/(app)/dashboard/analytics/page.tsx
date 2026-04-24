"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DragonMascot } from "@/components/dashboard/DragonMascot";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { ContentTable } from "@/components/dashboard/ContentTable";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type ContentStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PROCESSING"
  | "POSTED"
  | "FAILED";

interface AccountStats {
  posted: number;
  scheduled: number;
  processing: number;
  failed: number;
  total: number;
  successRate: number;
  lastPostedAt: string | null;
  nextPostAt: string | null;
  dailyCounts: Array<{ date: string; posted: number; failed: number }>;
}

interface AccountBlock {
  id: string;
  username: string;
  displayName: string | null;
  tier: "FREE" | "SCHEDULER" | "CREATOR" | "CLIPPER" | "STUDIO" | "STUDIO_PRO" | "AGENCY";
  videosPerWeek: number;
  videoType: string;
  isLinked: boolean;
  stats: AccountStats;
  recent: Array<{
    id: string;
    title: string;
    status: ContentStatus;
    scheduledAt: string | null;
    postedAt: string | null;
    tiktokPostId: string | null;
    createdAt: string;
  }>;
}

type DateRange = 7 | 30 | 90;

const STATUS_STYLE: Record<ContentStatus, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-bg-tertiary", text: "text-text-secondary" },
  SCHEDULED: { bg: "bg-accent-ember/20", text: "text-accent-ember" },
  PROCESSING: { bg: "bg-accent-fire/20", text: "text-accent-fire" },
  POSTED: { bg: "bg-success/20", text: "text-success" },
  FAILED: { bg: "bg-error/20", text: "text-error" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}

function daysFromNow(iso: string | null): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "any moment";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `in ${hours}h`;
  return `in ${Math.round(hours / 24)}d`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<{ accounts: AccountBlock[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(7);

  const fetchAnalytics = useCallback(async (days: DateRange) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/analytics?days=${days}`);
      if (!res.ok) {
        throw new Error("Failed to load analytics");
      }
      const json = (await res.json()) as { accounts: AccountBlock[] };
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics(dateRange);
  }, [dateRange, fetchAnalytics]);

  const accounts = data?.accounts ?? [];
  const linkedAccounts = accounts.filter((a) => a.isLinked);

  // Cross-account post history (POSTED + FAILED), sorted newest first.
  const postHistory = linkedAccounts
    .flatMap((a) =>
      a.recent
        .filter((r) => r.status === "POSTED" || r.status === "FAILED")
        .map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          scheduledAt: r.postedAt ?? r.scheduledAt,
          tiktokAccountUsername: a.username,
          tiktokPostId: r.tiktokPostId ?? undefined,
          _when: new Date(r.postedAt ?? r.createdAt).getTime(),
        })),
    )
    .sort((a, b) => b._when - a._when)
    .slice(0, 15);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">
            Posting performance per account.
          </p>
        </div>
        <div className="inline-flex rounded-md bg-bg-secondary border border-border p-1">
          {([7, 30, 90] as DateRange[]).map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                dateRange === d
                  ? "bg-accent-fire text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-bg-secondary border border-border p-8 text-center text-text-secondary">
          Loading…
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl bg-error/10 border border-error/20 p-6">
          <p className="text-sm text-error">{error}</p>
          <button
            className="mt-3 text-sm underline text-error"
            onClick={() => void fetchAnalytics(dateRange)}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && linkedAccounts.length === 0 && (
        <div className="rounded-xl bg-bg-secondary border border-border p-10 text-center">
          <div className="flex justify-center mb-4">
            <DragonMascot size={48} color="#ff4500" />
          </div>
          <h2 className="text-lg font-semibold font-heading">
            No linked TikTok accounts
          </h2>
          <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
            Link a TikTok account to start seeing posting analytics here. Stats
            appear automatically after your first post.
          </p>
          <Link
            href="/dashboard/accounts"
            className="inline-block mt-4 text-sm text-accent-fire hover:underline"
          >
            Go to accounts →
          </Link>
        </div>
      )}

      {!isLoading && !error && postHistory.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold font-heading mb-3">Post History</h2>
          <ContentTable items={postHistory.map(({ _when, ...rest }) => { void _when; return rest; })} />
        </section>
      )}

      {!isLoading && !error && linkedAccounts.map((acct) => (
        <motion.div
          key={acct.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl bg-bg-secondary border border-border overflow-hidden"
        >
          {/* Account header */}
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  @{acct.username}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {acct.videoType === "AI_IMAGES" ? "AI Images" : "Gameplay"} · {acct.videosPerWeek} videos/week
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TierBadge tier={acct.tier} />
              <Link
                href={`/dashboard/accounts/${acct.id}`}
                className="text-xs text-accent-fire hover:underline"
              >
                Manage →
              </Link>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-border border-b border-border">
            <StatTile label="Posted" value={acct.stats.posted} tone="success" />
            <StatTile label="Scheduled" value={acct.stats.scheduled} tone="ember" />
            <StatTile label="Processing" value={acct.stats.processing} tone="fire" />
            <StatTile label="Failed" value={acct.stats.failed} tone="error" />
            <StatTile label="Success" value={`${acct.stats.successRate}%`} tone="default" />
          </div>

          {/* Timing row */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-border">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                Last posted
              </p>
              <p className="text-text-primary font-medium">
                {formatDate(acct.stats.lastPostedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                Next scheduled
              </p>
              <p className="text-text-primary font-medium">
                {formatDate(acct.stats.nextPostAt)}
                <span className="text-text-secondary font-normal ml-1">
                  ({daysFromNow(acct.stats.nextPostAt)})
                </span>
              </p>
            </div>
          </div>

          {/* Daily chart */}
          <div className="p-5 border-b border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-3">
              Last {dateRange} days
            </p>
            <DailyChart data={acct.stats.dailyCounts} />
          </div>

          {/* Recent items */}
          <div className="p-5">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-3">
              Recent items
            </p>
            {acct.recent.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No content items yet. First post goes live after your next scheduled slot.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {acct.recent.map((r) => {
                  const style = STATUS_STYLE[r.status];
                  const when = r.postedAt ?? r.scheduledAt ?? r.createdAt;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-text-primary truncate">{r.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatDate(when)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                      >
                        {r.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "success" | "ember" | "fire" | "error" | "default";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "ember"
        ? "text-accent-ember"
        : tone === "fire"
          ? "text-accent-fire"
          : tone === "error"
            ? "text-error"
            : "text-text-primary";
  return (
    <div className="p-4 text-center">
      <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function DailyChart({
  data,
}: {
  data: Array<{ date: string; posted: number; failed: number }>;
}) {
  const max = Math.max(1, ...data.map((d) => d.posted + d.failed));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const total = d.posted + d.failed;
        const postedH = max > 0 ? (d.posted / max) * 100 : 0;
        const failedH = max > 0 ? (d.failed / max) * 100 : 0;
        const label = new Date(d.date).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${label}: ${d.posted} posted, ${d.failed} failed`}>
            <div className="w-full flex flex-col-reverse h-20">
              {d.posted > 0 && (
                <div
                  className="w-full bg-success rounded-t-sm"
                  style={{ height: `${postedH}%` }}
                />
              )}
              {d.failed > 0 && (
                <div
                  className="w-full bg-error"
                  style={{ height: `${failedH}%` }}
                />
              )}
              {total === 0 && (
                <div className="w-full bg-bg-tertiary rounded-t-sm" style={{ height: "4px" }} />
              )}
            </div>
            <span className="text-[10px] text-text-secondary">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
