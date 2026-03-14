"use client";

import { useState } from "react";
import Link from "next/link";
import { useTypedSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/Button";

interface Step {
  label: string;
  href: string;
  isComplete: (ctx: { hasAccount: boolean; hasSchedule: boolean }) => boolean;
}

const STEPS: Step[] = [
  {
    label: "Choose your plan",
    href: "/dashboard/settings",
    isComplete: () => true, // always complete for paid users
  },
  {
    label: "Connect your TikTok account",
    href: "/dashboard/accounts",
    isComplete: ({ hasAccount }) => hasAccount,
  },
  {
    label: "Set up your posting schedule",
    href: "/dashboard/schedule",
    isComplete: ({ hasSchedule }) => hasSchedule,
  },
];

export function OnboardingChecklist() {
  const { onboardingComplete, update } = useTypedSession();
  const [dismissing, setDismissing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (onboardingComplete || dismissed) {
    return null;
  }

  // For now, steps 2 and 3 show as incomplete (no real data yet)
  const ctx = { hasAccount: false, hasSchedule: false };
  const completedCount = STEPS.filter((s) => s.isComplete(ctx)).length;
  const allDone = completedCount === STEPS.length;

  async function handleDismiss() {
    setDismissing(true);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingComplete: true }),
      });
      await update();
      setDismissed(true);
    } catch {
      setDismissing(false);
    }
  }

  return (
    <div className="rounded-xl bg-bg-secondary border border-border p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          {allDone ? "You're all set!" : "Get started with DragonMadeIt"}
        </h3>
        <span className="text-xs text-text-secondary">
          {completedCount}/{STEPS.length} complete
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {STEPS.map((step, i) => {
          const done = step.isComplete(ctx);
          const isCurrent = !done && STEPS.slice(0, i).every((s) => s.isComplete(ctx));

          return (
            <Link
              key={step.label}
              href={step.href}
              className={`flex-1 flex items-center gap-3 rounded-lg px-4 py-3 border transition-colors ${
                done
                  ? "border-success/20 bg-success/5"
                  : isCurrent
                  ? "border-accent-fire/40 bg-accent-fire/5 animate-pulse"
                  : "border-border bg-bg-primary"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-success text-bg-primary"
                    : "bg-bg-tertiary text-text-secondary"
                }`}
              >
                {done ? "\u2713" : i + 1}
              </div>
              <span className={`text-sm ${done ? "text-success" : "text-text-primary"}`}>
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-4 text-center">
          <Button size="sm" onClick={handleDismiss} disabled={dismissing}>
            {dismissing ? "Saving..." : "Dismiss"}
          </Button>
        </div>
      )}
    </div>
  );
}
