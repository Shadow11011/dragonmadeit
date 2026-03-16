"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DragonMascot } from "@/components/dashboard/DragonMascot";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { ContentConfigEditor } from "@/components/dashboard/ContentConfigEditor";
import { TIER_CONFIG } from "@/types";
import type { ContentConfig, TikTokAccountInfo, PostingSchedule } from "@/types";
import { STORY_TYPE_CATALOGUE } from "@/lib/content-config";
import { getNextPostTime } from "@/lib/schedule-utils";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type HealthStatus = "idle" | "checking" | "healthy" | "unhealthy" | "error";

interface HealthResult {
  status: string;
  message?: string;
}

function formatTime12h(time24: string): string {
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ?? "00";
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${suffix}`;
}

function getStoryName(id: string): string {
  const story = STORY_TYPE_CATALOGUE.find((s) => s.id === id);
  return story ? `${story.emoji} ${story.name}` : id;
}

function formatCountdownFromMs(ms: number): string {
  if (ms <= 0) return "Now";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

function useCountdown(targetDate: Date | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return "--";
  const ms = targetDate.getTime() - now;
  return formatCountdownFromMs(ms);
}

/** Loading skeleton for the account detail page */
function AccountDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="h-4 w-40 rounded bg-bg-tertiary animate-pulse" />
      <div className="rounded-xl bg-bg-secondary border border-border p-6 space-y-4">
        <div className="h-8 w-64 rounded bg-bg-tertiary animate-pulse" />
        <div className="h-4 w-48 rounded bg-bg-tertiary animate-pulse" />
        <div className="h-10 w-40 rounded bg-bg-tertiary animate-pulse" />
      </div>
      <div className="rounded-xl bg-bg-secondary border border-border p-6 space-y-3">
        <div className="h-5 w-32 rounded bg-bg-tertiary animate-pulse" />
        <div className="h-4 w-full rounded bg-bg-tertiary animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-bg-tertiary animate-pulse" />
      </div>
    </div>
  );
}

/** Spinner SVG used for loading states on buttons */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<TikTokAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("idle");
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const isPending = account?.username.startsWith("pending-") ?? false;

  const nextPostDate = useMemo(() => {
    if (!account?.schedule || isPending) return null;
    return getNextPostTime(account.schedule);
  }, [account?.schedule, isPending]);

  const countdown = useCountdown(nextPostDate);

  const fetchAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tiktok-accounts");
      const data: unknown = await res.json();

      if (!res.ok) {
        const errData = data as { error?: string };
        throw new Error(errData.error ?? "Failed to fetch accounts");
      }

      const result = data as { success: boolean; data: TikTokAccountInfo[] };
      const found = result.data.find((a) => a.id === accountId);

      if (!found) {
        setError("Account not found");
        return;
      }

      setAccount(found);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load account";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    void fetchAccount();
  }, [fetchAccount]);

  async function handleConnect() {
    setIsConnecting(true);
    setConnectError(null);

    try {
      const res = await fetch(`/api/tiktok-accounts/${accountId}/connect`, {
        method: "POST",
      });

      const data: unknown = await res.json();

      if (res.ok) {
        const result = data as { success: boolean; data: { authUrl: string } };
        window.location.href = result.data.authUrl;
      } else {
        const errData = data as { error?: string };
        setConnectError(
          errData.error ?? "Failed to start TikTok connection. Please try again."
        );
        setIsConnecting(false);
      }
    } catch {
      setConnectError("Network error. Please check your connection and try again.");
      setIsConnecting(false);
    }
  }

  async function handleCheckHealth() {
    setHealthStatus("checking");
    setHealthMessage(null);

    try {
      const res = await fetch(`/api/tiktok-accounts/${accountId}/health`);
      const data: unknown = await res.json();

      if (res.ok) {
        const result = data as { success: boolean; data: HealthResult };
        const isHealthy =
          result.data.status === "healthy" || result.data.status === "connected";
        setHealthStatus(isHealthy ? "healthy" : "unhealthy");
        setHealthMessage(result.data.message ?? result.data.status);
      } else {
        const errData = data as { error?: string };
        setHealthStatus("error");
        setHealthMessage(errData.error ?? "Failed to check account health");
      }
    } catch {
      setHealthStatus("error");
      setHealthMessage("Network error. Please try again.");
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data: unknown = await res.json();
      const urlData = data as { url?: string; error?: string };

      if (res.ok && urlData.url) {
        window.location.href = urlData.url;
      } else {
        setPortalError(urlData.error ?? "Failed to open billing portal. Please try again.");
      }
    } catch {
      setPortalError("Network error. Please check your connection and try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleCancelSubscription() {
    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/tiktok-accounts/${accountId}/cancel`, {
        method: "POST",
      });

      const data: unknown = await res.json();

      if (res.ok) {
        setShowCancelConfirm(false);
        void fetchAccount();
      } else {
        const errData = data as { error?: string };
        setCancelError(errData.error ?? "Failed to cancel subscription.");
      }
    } catch {
      setCancelError("Network error. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  }

  function handleContentSaved() {
    setShowContentEditor(false);
    void fetchAccount();
  }

  const contentConfig: ContentConfig | null = account
    ? {
        videoType: account.videoType,
        voiceType: account.voiceType,
        storyTypes: account.storyTypes,
        randomizeStories: account.randomizeStories,
      }
    : null;

  // Loading state
  if (isLoading) {
    return <AccountDetailSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Link
            href="/dashboard/accounts"
            className="hover:text-text-primary transition-colors"
          >
            Accounts
          </Link>
          <span>/</span>
          <span className="text-text-primary">Error</span>
        </div>
        <div className="rounded-xl bg-bg-secondary border border-border p-8 text-center">
          <div className="flex justify-center mb-4">
            <DragonMascot size={56} color="#ef4444" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard/accounts">
              <Button variant="secondary">Back to Accounts</Button>
            </Link>
            <Button
              className="fire-gradient text-white"
              onClick={() => void fetchAccount()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!account) return null;

  const tierConfig = TIER_CONFIG[account.tier];

  // ── Pending State ──
  if (isPending) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Link
            href="/dashboard/accounts"
            className="hover:text-text-primary transition-colors"
          >
            Accounts
          </Link>
          <span>/</span>
          <span className="text-text-primary">Connect TikTok</span>
        </div>

        {/* Connect card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-bg-secondary border border-border p-8"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <DragonMascot size={56} color="#ff4500" />
            </div>
            <h1 className="text-2xl font-bold">Connect Your TikTok Account</h1>
            <p className="text-text-secondary text-sm mt-2">
              Connect your TikTok to start automated posting. You&apos;ll be
              redirected to TikTok&apos;s authorization page.
            </p>
          </div>

          {/* Connect error */}
          <AnimatePresence>
            {connectError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error mb-6"
              >
                {connectError}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            className="w-full fire-gradient text-white glow-fire"
            size="lg"
            disabled={isConnecting}
            onClick={() => void handleConnect()}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Connecting...
              </span>
            ) : (
              "Connect with TikTok"
            )}
          </Button>
        </motion.div>

        {/* Content Config Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl bg-bg-secondary border border-border p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              Content Configuration
            </h2>
            <div className="flex items-center gap-2">
              <TierBadge tier={account.tier} />
              <span className="text-xs text-text-secondary">
                {tierConfig.videosPerWeek} videos/week
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                Video Type
              </p>
              <p className="text-sm text-text-primary font-medium">
                {account.videoType === "GAMEPLAY" ? "Gameplay" : "AI Images"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                Voice
              </p>
              <p className="text-sm text-text-primary font-medium capitalize">
                {account.voiceType.toLowerCase()}
              </p>
            </div>
          </div>

          {account.storyTypes.length > 0 && (
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                Story Types
              </p>
              <div className="flex flex-wrap gap-2">
                {account.storyTypes.map((storyId) => (
                  <span
                    key={storyId}
                    className="inline-flex items-center rounded-lg bg-bg-tertiary px-2.5 py-1 text-xs text-text-primary"
                  >
                    {getStoryName(storyId)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {account.schedule && (
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                Schedule
                <span className="ml-2 inline-flex items-center rounded-full bg-accent-fire/10 text-accent-fire px-2 py-0.5 text-[10px] font-medium uppercase">
                  Locked
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {account.schedule.days.map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center rounded-md bg-bg-tertiary px-2 py-0.5 text-xs text-text-primary"
                  >
                    {DAY_NAMES[day]}
                  </span>
                ))}
              </div>
              {account.schedule.times?.length > 0 && (
                <p className="text-xs text-text-secondary mt-1.5">
                  Posting at{" "}
                  {account.schedule.times
                    .map((t) => formatTime12h(t))
                    .join(", ")}{" "}
                  ({account.schedule.timezone})
                </p>
              )}
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowContentEditor(!showContentEditor)}
            >
              {showContentEditor ? "Hide Editor" : "Edit Content"}
            </Button>
          </div>

          <AnimatePresence>
            {showContentEditor && contentConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-border">
                  <ContentConfigEditor
                    accountId={accountId}
                    initialConfig={contentConfig}
                    onSaved={handleContentSaved}
                    onCancel={() => setShowContentEditor(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // ── Connected / Active State ──
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link
          href="/dashboard/accounts"
          className="hover:text-text-primary transition-colors"
        >
          Accounts
        </Link>
        <span>/</span>
        <span className="text-text-primary">@{account.username}</span>
      </div>

      {/* Account header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-bg-secondary border border-border p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-fire/10 text-accent-fire font-bold text-lg shrink-0">
              {account.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold truncate">
                  @{account.username}
                </h1>
                <TierBadge tier={account.tier} />
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                {tierConfig.videosPerWeek} videos/week
                {account.displayName && ` \u00B7 ${account.displayName}`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next Video Timer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-xl bg-bg-secondary border border-border p-6"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          Next Scheduled Post
        </h2>
        {nextPostDate ? (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-3xl font-bold text-accent-fire">{countdown}</p>
              <p className="text-xs text-text-secondary mt-1">
                {nextPostDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at{" "}
                {nextPostDate.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-accent-fire/20 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full fire-gradient opacity-80" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No upcoming posts scheduled. Check your schedule configuration.
          </p>
        )}
      </motion.div>

      {/* Content Config */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl bg-bg-secondary border border-border p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Content Configuration
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowContentEditor(!showContentEditor)}
          >
            {showContentEditor ? "Hide Editor" : "Edit"}
          </Button>
        </div>

        {!showContentEditor && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                  Video Type
                </p>
                <p className="text-sm text-text-primary font-medium">
                  {account.videoType === "GAMEPLAY" ? "Gameplay" : "AI Images"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                  Voice
                </p>
                <p className="text-sm text-text-primary font-medium capitalize">
                  {account.voiceType.toLowerCase()}
                </p>
              </div>
            </div>

            {account.storyTypes.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                  Story Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {account.storyTypes.map((storyId) => (
                    <span
                      key={storyId}
                      className="inline-flex items-center rounded-lg bg-bg-tertiary px-2.5 py-1 text-xs text-text-primary"
                    >
                      {getStoryName(storyId)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                Story Order
              </p>
              <p className="text-sm text-text-primary font-medium">
                {account.randomizeStories ? "Randomized" : "Sequential"}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showContentEditor && contentConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border">
                <ContentConfigEditor
                  accountId={accountId}
                  initialConfig={contentConfig}
                  onSaved={handleContentSaved}
                  onCancel={() => setShowContentEditor(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Schedule (display only, locked) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-xl bg-bg-secondary border border-border p-6 space-y-3"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Schedule</h2>
          <span className="inline-flex items-center rounded-full bg-accent-fire/10 text-accent-fire px-2 py-0.5 text-[10px] font-medium uppercase">
            Locked
          </span>
        </div>

        {account.schedule ? (
          <>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                Posting Days
              </p>
              <div className="flex flex-wrap gap-1.5">
                {account.schedule.days.map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center rounded-md bg-bg-tertiary px-2.5 py-1 text-xs text-text-primary"
                  >
                    {DAY_NAMES[day]}
                  </span>
                ))}
              </div>
            </div>
            {account.schedule.times?.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                  Posting Time
                </p>
                <p className="text-sm text-text-primary font-medium">
                  {account.schedule.times
                    .map((t) => formatTime12h(t))
                    .join(", ")}{" "}
                  ({account.schedule.timezone})
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-text-secondary">
            No schedule configured for this account.
          </p>
        )}
      </motion.div>

      {/* Check Health */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-xl bg-bg-secondary border border-border p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Account Health
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Verify your TikTok connection is active and working.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={healthStatus === "checking"}
            onClick={() => void handleCheckHealth()}
          >
            {healthStatus === "checking" ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Checking...
              </span>
            ) : (
              "Check Health"
            )}
          </Button>
        </div>

        <AnimatePresence>
          {healthStatus !== "idle" && healthStatus !== "checking" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                healthStatus === "healthy"
                  ? "bg-success/10 border border-success/20 text-success"
                  : healthStatus === "unhealthy"
                    ? "bg-warning/10 border border-warning/20 text-warning"
                    : "bg-error/10 border border-error/20 text-error"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {healthStatus === "healthy"
                    ? "Healthy"
                    : healthStatus === "unhealthy"
                      ? "Unhealthy"
                      : "Error"}
                </span>
                {healthMessage && (
                  <span className="opacity-80">
                    &mdash; {healthMessage}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="rounded-xl bg-bg-secondary border border-border p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-text-primary">
          Subscription
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary font-medium">
              {tierConfig.name} Plan
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              ${tierConfig.monthlyPrice}/month &middot; {tierConfig.videosPerWeek} videos/week
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={portalLoading}
            onClick={() => void handleManageBilling()}
          >
            {portalLoading ? "Opening..." : "Manage in Stripe"}
          </Button>
        </div>

        {portalError && (
          <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
            {portalError}
          </div>
        )}

        {/* Cancel subscription */}
        <div className="pt-2 border-t border-border">
          <AnimatePresence>
            {!showCancelConfirm ? (
              <motion.button
                key="cancel-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                type="button"
                className="text-sm text-error hover:text-error/80 transition-colors"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Subscription
              </motion.button>
            ) : (
              <motion.div
                key="cancel-confirm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg bg-error/5 border border-error/20 p-4 space-y-3">
                  <p className="text-sm text-text-primary font-medium">
                    Are you sure?
                  </p>
                  <p className="text-xs text-text-secondary">
                    Your TikTok account will be unlinked and automated posting will stop immediately.
                  </p>
                  {cancelError && (
                    <p className="text-xs text-error">{cancelError}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setShowCancelConfirm(false);
                        setCancelError(null);
                      }}
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      size="sm"
                      className="bg-error hover:bg-error/90 text-white"
                      disabled={isCancelling}
                      onClick={() => void handleCancelSubscription()}
                    >
                      {isCancelling ? (
                        <span className="flex items-center gap-2">
                          <Spinner />
                          Cancelling...
                        </span>
                      ) : (
                        "Yes, Cancel"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
