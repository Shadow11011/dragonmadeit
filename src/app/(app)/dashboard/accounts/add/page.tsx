"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { ContentConfigStep } from "@/components/dashboard/ContentConfigStep";
import { cn } from "@/lib/utils";
import {
  TIER_CONFIG,
  type Tier,
  type BillingInterval,
  type ContentConfig,
  getTierPrice,
  getEffectiveMonthlyPrice,
  formatPrice,
} from "@/types";
import { useCurrency } from "@/lib/geo";
import { STORY_TYPE_CATALOGUE } from "@/lib/content-config";
import { collectDeviceFingerprint } from "@/lib/device-fingerprint";

type Step = "tier" | "content" | "schedule" | "payment";

interface ScheduleConfig {
  days: string[];
  times: string[];
}

// Self-serve wizard tiers. AGENCY is custom-billed and not shown in the
// self-serve flow — enterprise leads come through the contact path.
type WizardTier = Exclude<Tier, "AGENCY">;
const WIZARD_TIERS: WizardTier[] = [
  "FREE",
  "SCHEDULER",
  "CREATOR",
  "CLIPPER",
  "STUDIO",
  "STUDIO_PRO",
];

const TIER_BORDER_COLORS: Record<Tier, string> = {
  FREE: "border-text-secondary/30 hover:border-text-secondary/60",
  SCHEDULER: "border-[#4fb0c6]/40 hover:border-[#4fb0c6]/70",
  CREATOR: "border-[#c87533]/40 hover:border-[#c87533]/70",
  CLIPPER: "border-[#ff8c00]/40 hover:border-[#ff8c00]/70",
  STUDIO: "border-accent-ember/40 hover:border-accent-ember/70",
  STUDIO_PRO: "border-accent-gold/40 hover:border-accent-gold/70",
  AGENCY: "border-accent-gold/40 hover:border-accent-gold/70",
};

const TIER_SELECTED_BORDER: Record<Tier, string> = {
  FREE: "border-text-secondary ring-2 ring-text-secondary/25",
  SCHEDULER: "border-[#4fb0c6] ring-2 ring-[#4fb0c6]/20",
  CREATOR: "border-[#c87533] ring-2 ring-[#c87533]/20",
  CLIPPER: "border-[#ff8c00] ring-2 ring-[#ff8c00]/20",
  STUDIO: "border-accent-ember ring-2 ring-accent-ember/20",
  STUDIO_PRO: "border-accent-gold ring-2 ring-accent-gold/20",
  AGENCY: "border-accent-gold ring-2 ring-accent-gold/20",
};

const WEEKDAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

const DAY_NAME_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function formatTimePreview(t: string): string {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${period}`;
}

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StepIndicator({
  currentStep,
  selectedTier,
}: {
  currentStep: Step;
  selectedTier: Tier | null;
}) {
  const lastLabel = selectedTier === "FREE" ? "Activate" : "Payment";
  const steps: { key: Step; label: string; number: number }[] = [
    { key: "tier", label: "Choose Tier", number: 1 },
    { key: "content", label: "Content Config", number: 2 },
    { key: "schedule", label: "Set Schedule", number: 3 },
    { key: "payment", label: lastLabel, number: 4 },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  isCompleted && "bg-success text-white",
                  isActive && "bg-accent-fire text-white",
                  !isActive && !isCompleted && "bg-bg-tertiary text-text-secondary"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:inline",
                  isActive ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-12 h-0.5",
                  i < currentIndex ? "bg-success" : "bg-bg-tertiary"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const BILLING_OPTIONS: { value: BillingInterval; label: string; badge?: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly", badge: "-15%" },
  { value: "ANNUAL", label: "Annual", badge: "-30%" },
];

function TierSelectionStep({
  selectedTier,
  billingInterval,
  onBillingIntervalChange,
  onSelect,
  onContinue,
  currency,
}: {
  selectedTier: Tier | null;
  billingInterval: BillingInterval;
  onBillingIntervalChange: (interval: BillingInterval) => void;
  onSelect: (tier: Tier) => void;
  onContinue: () => void;
  currency: "NGN" | "USD";
}) {
  const isFreeSelected = selectedTier === "FREE";
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Tier</h2>
        <p className="text-text-secondary text-sm mt-1">
          Start free with 4 watermarked gameplay videos a month, or pick a paid
          tier to unlock all 66 niches and remove the watermark.
        </p>
      </div>

      {/* Billing interval toggle — hidden for FREE since it doesn't apply */}
      {!isFreeSelected && (
        <div className="flex items-center justify-center gap-1 bg-bg-secondary rounded-lg p-1 w-fit mx-auto">
          {BILLING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onBillingIntervalChange(option.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                billingInterval === option.value
                  ? "bg-bg-tertiary text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {option.label}
              {option.badge && (
                <span className="ml-1 text-xs text-accent-fire">{option.badge}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {WIZARD_TIERS.map((tierKey) => {
          const config = TIER_CONFIG[tierKey];
          const isSelected = selectedTier === tierKey;
          const isFreeTier = tierKey === "FREE";
          // tierKey is WizardTier (Tier minus AGENCY). When not FREE, it's
          // automatically a SelfServePaidTier.
          const paidKey = tierKey as Exclude<WizardTier, "FREE">;
          const effectiveMonthly = isFreeTier
            ? 0
            : getEffectiveMonthlyPrice(paidKey, billingInterval, currency);

          return (
            <button
              key={tierKey}
              type="button"
              onClick={() => onSelect(tierKey)}
              className={cn(
                "relative rounded-xl border-2 bg-bg-primary p-6 text-left transition-all",
                isSelected
                  ? TIER_SELECTED_BORDER[tierKey]
                  : TIER_BORDER_COLORS[tierKey]
              )}
            >
              {isFreeTier && (
                <span
                  className="absolute -top-2 left-4 rounded-full bg-text-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary"
                >
                  No card
                </span>
              )}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: config.fireColor }}
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-bg-primary" />
                  </div>
                </div>
              )}

              <h3
                className="text-lg font-bold"
                style={{ color: config.fireColor }}
              >
                {config.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold fire-text">
                  {isFreeTier ? "$0" : formatPrice(effectiveMonthly, currency)}
                </span>
                <span className="text-text-secondary text-sm">
                  {isFreeTier ? "forever" : "/mo"}
                </span>
              </div>
              {!isFreeTier && billingInterval !== "MONTHLY" && (
                <p className="text-xs text-accent-fire mt-1">
                  {formatPrice(getTierPrice(paidKey, billingInterval, currency), currency)} billed {billingInterval === "QUARTERLY" ? "quarterly" : "annually"}
                </p>
              )}
              <p className="text-xs text-text-secondary mt-2">
                {config.description}
              </p>

              <div className="mt-4 pt-4 border-t border-border">
                <ul className="space-y-2">
                  {config.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <CheckIcon
                        className="h-4 w-4 mt-0.5 shrink-0 text-success"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!selectedTier}
          onClick={onContinue}
          className="fire-gradient text-white"
          size="lg"
        >
          Continue to Content
        </Button>
      </div>
    </div>
  );
}

function ScheduleStep({
  tier,
  billingInterval,
  currency,
  schedule,
  onScheduleChange,
  onBack,
  onContinue,
}: {
  tier: Tier;
  billingInterval: BillingInterval;
  currency: "NGN" | "USD";
  schedule: ScheduleConfig;
  onScheduleChange: (schedule: ScheduleConfig) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const config = TIER_CONFIG[tier];
  const videosPerWeek = config.videosPerWeek;
  const needsMultiplePerDay = videosPerWeek > 7;

  // For tiers with <= 7 videos/week, pick exactly that many days
  // For higher-volume tiers (>7/week), all 7 days are auto-selected with multiple posts per day
  const requiredDays = needsMultiplePerDay ? 7 : videosPerWeek;

  const requiredTimes = needsMultiplePerDay ? 2 : 1;

  const toggleDay = (dayKey: string) => {
    if (needsMultiplePerDay) return; // All days locked for 14/week

    const isSelected = schedule.days.includes(dayKey);
    let newDays: string[];

    if (isSelected) {
      newDays = schedule.days.filter((d) => d !== dayKey);
    } else if (schedule.days.length < requiredDays) {
      newDays = [...schedule.days, dayKey];
    } else {
      // At limit, swap the oldest selection
      newDays = [...schedule.days.slice(1), dayKey];
    }

    onScheduleChange({ ...schedule, days: newDays });
  };

  const setTimeAtIndex = (index: number, value: string) => {
    const newTimes = [...schedule.times];
    newTimes[index] = value;
    onScheduleChange({ ...schedule, times: newTimes });
  };

  // Auto-select all days when cadence exceeds 7 posts/week (multiple posts per day)
  const effectiveDays = needsMultiplePerDay
    ? WEEKDAYS.map((d) => d.key)
    : schedule.days;

  const filledTimes = schedule.times.filter((t) => t !== "");
  const isValid =
    effectiveDays.length === requiredDays && filledTimes.length === requiredTimes;

  const isFree = tier === "FREE";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isFree ? "Pick your weekly slot" : "Set Your Schedule"}
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          {isFree
            ? "We post once a week on free. Pick the one day and time below — this is locked until you upgrade, so choose a moment you can trust."
            : `Choose when your ${videosPerWeek} videos per week will be posted.`}
        </p>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning flex items-start gap-2">
        <svg
          className="h-5 w-5 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span>
          {isFree ? (
            <>
              Your free slot is <strong>locked after activation</strong>. To change the
              day or time later, you&rsquo;ll need to upgrade.
            </>
          ) : (
            <>
              This schedule is <strong>locked after purchase</strong> and cannot be
              changed. Choose carefully!
            </>
          )}
        </span>
      </div>

      {/* Tier summary */}
      <div className="rounded-xl bg-bg-secondary border border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TierBadge tier={tier} />
          <span className="text-sm text-text-secondary">
            {videosPerWeek} videos per week
            {needsMultiplePerDay && " (2x daily)"}
          </span>
        </div>
        <span className="text-sm font-medium fire-text">
          {tier === "FREE" || tier === "AGENCY"
            ? tier === "AGENCY"
              ? "Custom"
              : "$0 forever"
            : `${formatPrice(getEffectiveMonthlyPrice(tier, billingInterval, currency), currency)}/mo`}
        </span>
      </div>

      {/* Day picker */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          {needsMultiplePerDay
            ? "Posting days (all days — 2 posts per day)"
            : isFree
              ? "Which day each week?"
              : `Select ${requiredDays} posting day${requiredDays !== 1 ? "s" : ""}`}
          <span className="ml-2 text-text-secondary font-normal">
            ({effectiveDays.length}/{requiredDays} selected)
          </span>
        </label>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => {
            const isSelected = effectiveDays.includes(day.key);
            const isDisabled = needsMultiplePerDay;

            return (
              <button
                key={day.key}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleDay(day.key)}
                className={cn(
                  "rounded-lg py-3 px-2 text-center text-sm font-medium transition-all border",
                  isSelected
                    ? "bg-accent-fire/15 border-accent-fire text-accent-fire"
                    : "bg-bg-primary border-border text-text-secondary hover:border-accent-fire/30 hover:text-text-primary",
                  isDisabled && isSelected && "opacity-80 cursor-default"
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time picker */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          {needsMultiplePerDay
            ? "Posting times (2 per day)"
            : isFree
              ? "And what time?"
              : "Posting time"}
        </label>
        <div className={cn(needsMultiplePerDay ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "max-w-xs")}>
          <div>
            {needsMultiplePerDay && (
              <p className="text-xs text-text-secondary mb-1.5">First post</p>
            )}
            <input
              type="time"
              value={schedule.times[0] ?? ""}
              onChange={(e) => setTimeAtIndex(0, e.target.value)}
              className="w-full rounded-lg bg-bg-primary border border-border px-4 py-3 text-sm text-text-primary focus:border-accent-fire focus:outline-none focus:ring-1 focus:ring-accent-fire [color-scheme:dark]"
            />
          </div>
          {needsMultiplePerDay && (
            <div>
              <p className="text-xs text-text-secondary mb-1.5">Second post</p>
              <input
                type="time"
                value={schedule.times[1] ?? ""}
                onChange={(e) => setTimeAtIndex(1, e.target.value)}
                className="w-full rounded-lg bg-bg-primary border border-border px-4 py-3 text-sm text-text-primary focus:border-accent-fire focus:outline-none focus:ring-1 focus:ring-accent-fire [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Schedule preview */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-bg-tertiary border border-border p-4"
        >
          <p className="text-sm text-text-secondary mb-1">Schedule preview:</p>
          <p className="text-sm font-medium text-text-primary">
            {needsMultiplePerDay
              ? `Every day at ${filledTimes.map(formatTimePreview).join(" and ")}`
              : `${effectiveDays
                  .map(
                    (d) =>
                      WEEKDAYS.find((w) => w.key === d)?.label ?? d
                  )
                  .join(", ")} at ${filledTimes.map(formatTimePreview).join(", ")}`}
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          disabled={!isValid}
          onClick={() => {
            if (needsMultiplePerDay) {
              onScheduleChange({
                ...schedule,
                days: WEEKDAYS.map((d) => d.key),
              });
            }
            onContinue();
          }}
          className="fire-gradient text-white"
          size="lg"
        >
          {tier === "FREE" ? "Continue to Activate" : "Continue to Payment"}
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({
  tier,
  billingInterval,
  schedule,
  contentConfig,
  currency,
  onBack,
}: {
  tier: Tier;
  billingInterval: BillingInterval;
  schedule: ScheduleConfig;
  contentConfig: ContentConfig;
  currency: "NGN" | "USD";
  onBack: () => void;
}) {
  const config = TIER_CONFIG[tier];
  const isFree = tier === "FREE";
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveDays =
    config.videosPerWeek > 7
      ? WEEKDAYS.map((d) => d.key)
      : schedule.days;

  // AGENCY is custom-billed and never reaches this step via the wizard, but
  // we guard anyway so the pricing maths are total.
  const isPaidSelfServe = tier !== "FREE" && tier !== "AGENCY";
  const totalPrice = isPaidSelfServe
    ? getTierPrice(tier as Exclude<Tier, "FREE" | "AGENCY">, billingInterval, currency)
    : 0;
  const effectiveMonthly = isPaidSelfServe
    ? getEffectiveMonthlyPrice(tier as Exclude<Tier, "FREE" | "AGENCY">, billingInterval, currency)
    : 0;

  async function handleCheckout() {
    setIsRedirecting(true);
    setError(null);

    try {
      // Convert weekday-name days to numbers and keep chosen times + timezone.
      const dayNums = effectiveDays
        .map((d) => DAY_NAME_TO_NUMBER[d.toLowerCase()])
        .filter((n): n is number => typeof n === "number")
        .sort();
      const cleanTimes = schedule.times.filter((t) => /^\d{2}:\d{2}$/.test(t));
      const normalizedSchedule =
        dayNums.length > 0 && cleanTimes.length > 0
          ? { days: dayNums, times: cleanTimes, timezone: "UTC" }
          : undefined;

      if (isFree) {
        // FREE tier: no payment provider call, create account directly.
        // Collect a device fingerprint first — server uses it to prevent a
        // single device from minting multiple free accounts.
        let deviceFingerprint: string;
        try {
          deviceFingerprint = await collectDeviceFingerprint();
        } catch {
          setError("Could not verify your browser. Please reload and try again.");
          setIsRedirecting(false);
          return;
        }

        const res = await fetch("/api/tiktok-accounts/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentConfig,
            schedule: normalizedSchedule,
            deviceFingerprint,
          }),
        });
        const data: unknown = await res.json();
        const result = data as {
          success?: boolean;
          accountId?: string;
          error?: string;
          code?: string;
        };
        if (res.ok && result.success) {
          window.location.href = "/dashboard/accounts?activated=free";
          return;
        }
        setError(result.error ?? "Could not activate free tier. Please try again.");
        setIsRedirecting(false);
        return;
      }

      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          billingInterval,
          schedule: normalizedSchedule,
        }),
      });

      const data: unknown = await res.json();
      const urlData = data as {
        success?: boolean;
        data?: { checkoutUrl?: string };
        error?: string;
      };

      if (res.ok && urlData.data?.checkoutUrl) {
        // Redirect to Dodo hosted checkout
        window.location.href = urlData.data.checkoutUrl;
      } else {
        setError(urlData.error ?? "Failed to start checkout. Please try again.");
        setIsRedirecting(false);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsRedirecting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isFree ? "Activate Your Free Plan" : "Review & Pay"}
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          {isFree
            ? "Confirm your setup. No payment — we'll activate your free account and link your TikTok next."
            : "Confirm your subscription details before proceeding to payment."}
        </p>
      </div>

      {isFree && (
        <div className="rounded-lg border border-text-secondary/30 bg-bg-tertiary/40 px-4 py-3 text-xs text-text-secondary space-y-2">
          <p className="font-semibold text-text-primary text-sm">Free tier limits</p>
          <ul className="space-y-1">
            <li>• 4 videos per month (1 per week, posted on your schedule)</li>
            <li>• Gameplay overlay content only — AI-image niches locked</li>
            <li>• &ldquo;dragonmadeit.app&rdquo; watermark on every video + 2-sec end card</li>
            <li>• Upgrade anytime to remove the watermark and unlock everything</li>
          </ul>
        </div>
      )}

      {/* Order summary */}
      <div className="rounded-xl bg-bg-secondary border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TierBadge tier={tier} />
              <span className="font-semibold">{config.name}</span>
            </div>
            <span className="text-lg font-bold fire-text">
              {isFree ? "$0 forever" : `${formatPrice(effectiveMonthly, currency)}/mo`}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              Videos per week
            </p>
            <p className="text-sm font-medium">{config.videosPerWeek}</p>
          </div>

          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              Content config
            </p>
            <div className="space-y-1 mt-1">
              <p className="text-sm font-medium">
                {contentConfig.videoType === "GAMEPLAY"
                  ? "Gameplay Overlay"
                  : "AI Image Slideshow"}
              </p>
              <p className="text-xs text-text-secondary">
                Voice:{" "}
                {contentConfig.voiceType === "MALE"
                  ? "Male"
                  : contentConfig.voiceType === "FEMALE"
                    ? "Female"
                    : "Random"}
              </p>
              <p className="text-xs text-text-secondary">
                Stories:{" "}
                {contentConfig.storyTypes
                  .map(
                    (id) =>
                      STORY_TYPE_CATALOGUE.find((s) => s.id === id)?.name ?? id
                  )
                  .join(", ")}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              Schedule
            </p>
            <p className="text-sm font-medium">
              {config.videosPerWeek > 7
                ? `Every day at ${schedule.times.filter((t) => t !== "").map(formatTimePreview).join(" and ")}`
                : `${effectiveDays
                    .map(
                      (d) =>
                        WEEKDAYS.find((w) => w.key === d)?.label ?? d
                    )
                    .join(", ")} at ${schedule.times.filter((t) => t !== "").map(formatTimePreview).join(", ")}`}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              Features included
            </p>
            <ul className="space-y-1.5 mt-1">
              {config.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <CheckIcon className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-bg-tertiary/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {isFree
                ? "Total"
                : billingInterval === "MONTHLY"
                  ? "Monthly total"
                  : billingInterval === "QUARTERLY"
                    ? "Quarterly total"
                    : "Annual total"}
            </span>
            <div className="text-right">
              <span className="text-xl font-bold fire-text">
                {isFree ? "$0" : formatPrice(totalPrice, currency)}
              </span>
              {!isFree && billingInterval !== "MONTHLY" && (
                <p className="text-xs text-text-secondary">
                  {formatPrice(effectiveMonthly, currency)}/mo effective
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule lock reminder */}
      <div className="rounded-lg bg-bg-tertiary border border-border px-4 py-3 text-xs text-text-secondary">
        Your posting schedule is locked after {isFree ? "activation" : "purchase"}. Next, you&apos;ll
        be asked to link your TikTok account.
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} disabled={isRedirecting}>
          Back
        </Button>
        <Button
          onClick={() => void handleCheckout()}
          disabled={isRedirecting}
          className="fire-gradient text-white glow-fire"
          size="lg"
        >
          {isRedirecting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {isFree ? "Activating..." : "Redirecting to payment..."}
            </span>
          ) : isFree ? (
            "Activate free account"
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AddAccountPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("tier");
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");
  const { currency } = useCurrency();
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    days: [],
    times: [],
  });
  const [contentConfig, setContentConfig] = useState<ContentConfig>({
    videoType: "GAMEPLAY",
    voiceType: "RANDOM",
    storyTypes: [],
    randomizeStories: true,
  });

  // Pre-select FREE when the user arrives from /signup?tier=free or ?tier=free links.
  useEffect(() => {
    if (selectedTier !== null) return;
    const requested = searchParams?.get("tier")?.toUpperCase();
    if (
      requested === "FREE" ||
      requested === "SCHEDULER" ||
      requested === "CREATOR" ||
      requested === "CLIPPER" ||
      requested === "STUDIO" ||
      requested === "STUDIO_PRO"
    ) {
      setSelectedTier(requested as Tier);
    }
  }, [searchParams, selectedTier]);

  const handleTierSelect = (tier: Tier) => {
    setSelectedTier(tier);
    // Reset schedule when tier changes since videosPerWeek differs
    setSchedule({ days: [], times: [] });
    // FREE can only use gameplay — force videoType to GAMEPLAY if switching down to FREE.
    if (tier === "FREE" && contentConfig.videoType !== "GAMEPLAY") {
      setContentConfig({ ...contentConfig, videoType: "GAMEPLAY" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link
          href="/dashboard/accounts"
          className="hover:text-text-primary transition-colors"
        >
          Accounts
        </Link>
        <span>/</span>
        <span className="text-text-primary">Add New Account</span>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} selectedTier={selectedTier} />

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          {step === "tier" && (
            <TierSelectionStep
              selectedTier={selectedTier}
              billingInterval={billingInterval}
              onBillingIntervalChange={setBillingInterval}
              onSelect={handleTierSelect}
              onContinue={() => setStep("content")}
              currency={currency}
            />
          )}

          {step === "content" && (
            <ContentConfigStep
              config={contentConfig}
              onConfigChange={setContentConfig}
              onBack={() => setStep("tier")}
              onContinue={() => setStep("schedule")}
              tier={selectedTier ?? undefined}
            />
          )}

          {step === "schedule" && selectedTier && (
            <ScheduleStep
              tier={selectedTier}
              billingInterval={billingInterval}
              currency={currency}
              schedule={schedule}
              onScheduleChange={setSchedule}
              onBack={() => setStep("content")}
              onContinue={() => setStep("payment")}
            />
          )}

          {step === "payment" && selectedTier && (
            <PaymentStep
              tier={selectedTier}
              billingInterval={billingInterval}
              schedule={schedule}
              contentConfig={contentConfig}
              currency={currency}
              onBack={() => setStep("schedule")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
