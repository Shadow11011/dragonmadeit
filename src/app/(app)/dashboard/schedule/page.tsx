"use client";

import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";
import { ContentTable } from "@/components/dashboard/ContentTable";

const MOCK_SCHEDULED_ITEMS = [
  {
    id: "s1",
    title: "Morning routine tips",
    status: "POSTED",
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
  {
    id: "s2",
    title: "Product showcase video",
    status: "SCHEDULED",
    scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
  {
    id: "s3",
    title: "Behind the scenes",
    status: "SCHEDULED",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "flamecreator",
  },
  {
    id: "s4",
    title: "Tutorial: Quick editing tricks",
    status: "DRAFT",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
  {
    id: "s5",
    title: "Trending sound remix",
    status: "SCHEDULED",
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "flamecreator",
  },
  {
    id: "s6",
    title: "Q&A session highlights",
    status: "PROCESSING",
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
    tiktokAccountUsername: "dragonscale_tips",
  },
];

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedule</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">Week Overview</h2>
        <ScheduleCalendar />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Upcoming Content</h2>
        <ContentTable items={MOCK_SCHEDULED_ITEMS} />
      </section>
    </div>
  );
}
