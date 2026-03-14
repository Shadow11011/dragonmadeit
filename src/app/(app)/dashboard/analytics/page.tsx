"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { useTypedSession } from "@/hooks/useSession";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOCK_BAR_HEIGHTS = [65, 45, 80, 55, 90, 40, 70]; // percentages

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

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2L12.09 7.26L18 7.64L13.45 11.38L14.82 17L10 14.27L5.18 17L6.55 11.38L2 7.64L7.91 7.26L10 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  const { hasActiveSubscription } = useTypedSession();

  // Analytics requires an active subscription; per-account analytics features
  // will be refined when account-level tier checks are added to this page.
  if (!hasActiveSubscription) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="rounded-xl bg-bg-secondary border border-border p-12 text-center space-y-4">
          <div className="text-4xl">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-text-secondary">
              <rect x="6" y="24" width="8" height="18" rx="2" fill="currentColor" opacity="0.3" />
              <rect x="18" y="14" width="8" height="28" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="30" y="8" width="8" height="34" rx="2" fill="currentColor" opacity="0.7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Analytics Not Available</h2>
          <p className="text-text-secondary max-w-md mx-auto">
            Analytics are available on the Drake plan and above. Upgrade to get detailed
            performance insights for your TikTok content.
          </p>
          <a
            href="/dashboard/settings"
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-accent-fire text-white font-semibold hover:brightness-110 transition-all text-sm"
          >
            Upgrade Plan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Views"
          value="4.8K"
          icon={<BarChartIcon />}
          trend={{ value: 15, isPositive: true }}
          accentColor="#ff4500"
        />
        <StatsCard
          label="Engagement Rate"
          value="6.2%"
          icon={<PercentIcon />}
          trend={{ value: 2.1, isPositive: true }}
          accentColor="#ff8c00"
        />
        <StatsCard
          label="Best Time"
          value="6 PM"
          icon={<ClockIcon />}
          accentColor="#ffd700"
        />
        <StatsCard
          label="Top Post"
          value="1.2K"
          icon={<StarIcon />}
          trend={{ value: 34, isPositive: true }}
          accentColor="#22c55e"
        />
      </div>

      {/* Bar chart — pure CSS */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Views This Week</h2>
        <div className="rounded-xl bg-bg-secondary border border-border p-6">
          <div className="flex items-end justify-between gap-3 h-48">
            {DAY_LABELS.map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-[40px] rounded-t-md fire-gradient transition-all duration-700"
                    style={{ height: `${MOCK_BAR_HEIGHTS[i]}%` }}
                  />
                </div>
                <span className="text-xs text-text-secondary">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement chart */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Engagement by Day</h2>
        <div className="rounded-xl bg-bg-secondary border border-border p-6">
          <div className="space-y-3">
            {DAY_LABELS.map((day, i) => {
              const value = [4.2, 5.8, 6.1, 3.9, 7.2, 5.5, 6.8][i];
              const maxValue = 10;
              const widthPercent = (value / maxValue) * 100;

              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-8">{day}</span>
                  <div className="flex-1 h-3 rounded-full bg-bg-tertiary overflow-hidden">
                    <div
                      className="h-full rounded-full fire-gradient transition-all duration-700"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-10 text-right">{value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
