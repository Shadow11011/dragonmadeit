"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Step {
  label: string;
  href: string;
  complete: boolean;
}

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);
  const [accountCount, setAccountCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/user/accounts/count");
        if (res.ok) {
          const data: unknown = await res.json();
          const countData = data as { count: number };
          setAccountCount(countData.count);
        }
      } catch {
        // Silently fail
      }
    }
    fetchCount();
  }, []);

  if (dismissed || accountCount > 0) {
    return null;
  }

  const steps: Step[] = [
    {
      label: "Create your account",
      href: "/dashboard",
      complete: true, // Always done if they are logged in
    },
    {
      label: "Add your first TikTok account",
      href: "/dashboard/accounts",
      complete: false,
    },
    {
      label: "Link your TikTok",
      href: "/dashboard/accounts",
      complete: false,
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;

  return (
    <div className="rounded-xl bg-bg-secondary border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          You&apos;re almost there
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary">
            {completedCount}/{steps.length} complete
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Dismiss checklist"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Fire-gradient progress bar */}
      <div className="mb-4">
        <div className="h-2 w-full rounded-full bg-bg-tertiary overflow-hidden">
          <div
            className="h-full rounded-full fire-gradient transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {steps.map((step, i) => {
          const isCurrent = !step.complete && steps.slice(0, i).every((s) => s.complete);

          return (
            <Link
              key={step.label}
              href={step.href}
              className={`flex-1 flex items-center gap-3 rounded-lg px-4 py-3 border transition-all ${
                step.complete
                  ? "border-success/20 bg-success/5"
                  : isCurrent
                  ? "border-accent-fire/40 bg-accent-fire/5 shadow-[0_0_12px_rgba(255,69,0,0.15)]"
                  : "border-border bg-bg-primary"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.complete
                    ? "bg-success text-bg-primary"
                    : "bg-bg-tertiary text-text-secondary"
                }`}
              >
                {step.complete ? "\u2713" : i + 1}
              </div>
              <span className={`text-sm ${step.complete ? "text-success" : "text-text-primary"}`}>
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
