"use client";

import { useEffect, useState } from "react";

interface ReferralData {
  referralCode: string;
  referralUrl: string;
  referredCount: number;
  creditsEarnedCents: number;
  creditsEarnedDisplay: string;
}

/**
 * Compact dashboard card showing the user's referral link + counters.
 * Fetches /api/referrals on mount. Renders a skeleton while loading and a
 * muted "unavailable" state on error (never blocks the surrounding page).
 */
export function ReferralWidget() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/referrals");
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const json = (await res.json()) as ReferralData;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCopy() {
    if (!data) return;
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(data.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Copy failed — select the link to copy manually.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-bg-secondary border border-border p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-bg-tertiary rounded" />
          <div className="h-10 bg-bg-tertiary rounded" />
          <div className="h-4 w-48 bg-bg-tertiary rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    // Endpoint failed or user not signed in from this surface — stay quiet.
    return null;
  }

  const hasCredit = data.creditsEarnedCents > 0;
  const hasReferrals = data.referredCount > 0;

  return (
    <div className="rounded-xl bg-bg-secondary border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-fire/10 text-accent-fire">
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7 10C8.66 10 10 8.66 10 7C10 5.34 8.66 4 7 4C5.34 4 4 5.34 4 7C4 8.66 5.34 10 7 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M13 13C14.1 13 15 12.1 15 11C15 9.9 14.1 9 13 9C11.9 9 11 9.9 11 11C11 12.1 11.9 13 13 13Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M2 17C2 14.8 4.24 13 7 13C9.76 13 12 14.8 12 17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M13 15C14.66 15 18 16 18 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-heading text-base text-text-primary">
            Refer a friend
          </h3>
          <p className="text-xs text-text-secondary">
            When they upgrade, you get $10 in credit on your next bill.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={data.referralUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 min-w-0 bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono truncate focus:outline-none focus:border-accent-fire/40 transition-colors"
          aria-label="Your referral link"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-border bg-bg-primary px-3 py-2 text-xs font-semibold text-text-primary hover:border-accent-fire/40 hover:bg-bg-tertiary transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {copyError && (
        <p className="mt-2 text-xs text-error">{copyError}</p>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
        <span>
          Invited{" "}
          <span className="text-text-primary font-medium">
            {data.referredCount}
          </span>{" "}
          {data.referredCount === 1 ? "friend" : "friends"}
        </span>
        {hasCredit && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>
              Earned{" "}
              <span className="text-accent-fire font-medium">
                {data.creditsEarnedDisplay}
              </span>{" "}
              in credit
            </span>
          </>
        )}
        {!hasCredit && !hasReferrals && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>No referrals yet</span>
          </>
        )}
      </div>
    </div>
  );
}
