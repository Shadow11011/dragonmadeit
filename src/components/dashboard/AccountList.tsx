"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { DragonMascot } from "@/components/dashboard/DragonMascot";
import { TIER_CONFIG, Tier } from "@/types";
import type { PostingSchedule } from "@/types";
import { getNextPostTime, formatCountdown } from "@/lib/schedule-utils";

export interface TikTokAccountItem {
  id: string;
  username: string | null;
  displayName: string | null;
  tier: Tier;
  status: "active" | "pending" | "cancelled";
  scheduleDays: string[];
  scheduleTime: string;
  schedule: PostingSchedule | null;
  videoType?: string;
  voiceType?: string;
  storyTypes?: string[];
  randomizeStories?: boolean;
}

interface AccountListProps {
  accounts: TikTokAccountItem[];
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-success", text: "text-success", label: "Active" },
  pending: { dot: "bg-warning", text: "text-warning", label: "Pending" },
  cancelled: { dot: "bg-error", text: "text-error", label: "Cancelled" },
};

const DAY_ABBREV: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function formatSchedule(days: string[], time: string): string {
  if (!days || days.length === 0) return "No schedule set";
  const abbrevDays = days.map((d) => DAY_ABBREV[d.toLowerCase()] ?? d);
  if (days.length === 7) return `Daily at ${time}`;
  return `${abbrevDays.join(", ")} at ${time}`;
}

function formatScheduleSlots(days: string[], time: string, videosPerWeek: number): string {
  if (!days || days.length === 0) return "No schedule set";
  if (videosPerWeek > 7) {
    const postsPerDay = Math.ceil(videosPerWeek / 7);
    return `${videosPerWeek}x/week (${postsPerDay}x daily) at ${time}`;
  }
  return formatSchedule(days, time);
}

function formatContentConfig(
  videoType?: string,
  voiceType?: string,
  storyTypes?: string[]
): string {
  if (!storyTypes || storyTypes.length === 0) return "No content configured";
  const videoLabel = videoType === "GAMEPLAY" ? "Gameplay" : videoType === "AI_IMAGES" ? "AI Images" : videoType ?? "Unknown";
  const voiceLabel = voiceType ? voiceType.charAt(0) + voiceType.slice(1).toLowerCase() : "Unknown";
  const storyCount = storyTypes.length;
  return `${videoLabel} \u00B7 ${voiceLabel} \u00B7 ${storyCount} story type${storyCount !== 1 ? "s" : ""}`;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function AccountList({ accounts, isLoading }: AccountListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-bg-secondary border border-border p-5 h-28"
          />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl bg-bg-secondary border border-border p-10 text-center">
        <div className="flex justify-center mb-4">
          <DragonMascot size={64} />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No accounts yet
        </h3>
        <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
          Add your first account to start posting on autopilot.
        </p>
        <Link href="/dashboard/accounts/add">
          <Button className="fire-gradient text-white glow-fire" size="lg">
            Add Your First Account
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {accounts.map((account) => {
        const tierConfig = TIER_CONFIG[account.tier];
        const statusStyle = STATUS_STYLES[account.status] ?? STATUS_STYLES.pending;

        return (
          <motion.div
            key={account.id}
            variants={itemVariants}
            className="rounded-xl bg-bg-secondary border border-border p-5 hover:border-accent-fire/30 hover:translate-y-[-1px] transition-all transition-transform"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar + Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full shrink-0",
                    "bg-accent-fire/10 text-accent-fire font-bold text-sm"
                  )}
                >
                  {account.username
                    ? account.username.charAt(0).toUpperCase()
                    : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {account.username ? (
                      <p className="font-medium truncate">
                        @{account.username}
                      </p>
                    ) : (
                      <p className="font-medium text-warning">
                        Pending — link your account
                      </p>
                    )}
                    <TierBadge tier={account.tier} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-text-secondary">
                      {tierConfig.videosPerWeek} videos/week
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatScheduleSlots(
                        account.scheduleDays,
                        account.scheduleTime,
                        tierConfig.videosPerWeek
                      )}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-secondary">
                      {formatContentConfig(
                        account.videoType,
                        account.voiceType,
                        account.storyTypes
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-3 sm:shrink-0">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn("h-2 w-2 rounded-full", statusStyle.dot)}
                    />
                    <span className={cn("text-xs font-medium", statusStyle.text)}>
                      {statusStyle.label}
                    </span>
                  </div>
                  {account.status === "active" && (() => {
                    const nextPost = getNextPostTime(account.schedule);
                    return nextPost ? (
                      <span className="text-xs text-text-secondary">
                        Next: {formatCountdown(nextPost)}
                      </span>
                    ) : null;
                  })()}
                </div>

                {account.status === "pending" && (
                  <Link href={`/dashboard/accounts/${account.id}`}>
                    <Button size="sm" className="fire-gradient text-white">
                      Connect TikTok
                    </Button>
                  </Link>
                )}

                {account.status === "active" && (
                  <Link href={`/dashboard/accounts/${account.id}`}>
                    <Button size="sm" variant="secondary">
                      Manage
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
