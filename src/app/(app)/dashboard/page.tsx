import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContentTable } from "@/components/dashboard/ContentTable";

const MOCK_CONTENT_ITEMS = [
  {
    id: "c1",
    title: "Morning routine productivity hack",
    status: "POSTED",
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
  {
    id: "c2",
    title: "Quick editing tutorial for beginners",
    status: "SCHEDULED",
    scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
  {
    id: "c3",
    title: "Behind the scenes: Content creation setup",
    status: "PROCESSING",
    scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "flamecreator",
  },
  {
    id: "c4",
    title: "Top 5 trending sounds this week",
    status: "DRAFT",
    scheduledAt: null,
    tiktokAccountUsername: undefined,
  },
  {
    id: "c5",
    title: "Engagement strategy breakdown",
    status: "FAILED",
    scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "flamecreator",
  },
];

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2C10 2 6 6 6 10C6 12.2 7.8 14 10 14C12.2 14 14 12.2 14 10C14 6 10 2 10 2ZM10 12C8.9 12 8 11.1 8 10C8 8.5 10 5.5 10 5.5C10 5.5 12 8.5 12 10C12 11.1 11.1 12 10 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 17C4 13.7 6.7 11 10 11C13.3 11 16 13.7 16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10C2 10 5 5 10 5C15 5 18 10 18 10C18 10 15 15 10 15C5 15 2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Posts"
          value={24}
          icon={<FlameIcon />}
          trend={{ value: 12, isPositive: true }}
          accentColor="#ff4500"
        />
        <StatsCard
          label="Scheduled"
          value={8}
          icon={<CalendarIcon />}
          accentColor="#ff8c00"
        />
        <StatsCard
          label="Accounts"
          value={2}
          icon={<UserIcon />}
          accentColor="#ffd700"
        />
        <StatsCard
          label="Views"
          value="1.2K"
          icon={<EyeIcon />}
          trend={{ value: 8, isPositive: true }}
          accentColor="#22c55e"
        />
      </div>

      {/* Recent Content */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
        <ContentTable items={MOCK_CONTENT_ITEMS} />
      </section>

      {/* Accounts summary */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "dragonscale_tips", display: "Dragon Scale Tips" },
            { name: "flamecreator", display: "Flame Creator" },
          ].map((account) => (
            <div
              key={account.name}
              className="flex items-center gap-3 rounded-xl bg-bg-secondary border border-border p-4 hover:border-accent-fire/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-fire/10 text-accent-fire font-bold text-sm">
                {account.display.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">@{account.name}</p>
                <p className="text-xs text-text-secondary">{account.display}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
