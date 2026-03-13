"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

type ContentStatusValue = "DRAFT" | "SCHEDULED" | "PROCESSING" | "POSTED" | "FAILED";

interface ScheduleItem {
  id: string;
  title: string;
  status: ContentStatusValue;
  time: string;
}

interface DayColumn {
  date: Date;
  dayName: string;
  dateLabel: string;
  isToday: boolean;
  items: ScheduleItem[];
}

const STATUS_COLORS: Record<ContentStatusValue, string> = {
  DRAFT: "bg-text-secondary",
  SCHEDULED: "bg-accent-ember",
  PROCESSING: "bg-warning",
  POSTED: "bg-success",
  FAILED: "bg-error",
};

function generateMockItems(): { dayOffset: number; item: ScheduleItem }[] {
  return [
    { dayOffset: 0, item: { id: "m1", title: "Morning routine tips", status: "POSTED", time: "9:00 AM" } },
    { dayOffset: 0, item: { id: "m2", title: "Product showcase", status: "SCHEDULED", time: "2:00 PM" } },
    { dayOffset: 1, item: { id: "m3", title: "Behind the scenes", status: "SCHEDULED", time: "11:00 AM" } },
    { dayOffset: 2, item: { id: "m4", title: "Tutorial: Quick editing", status: "DRAFT", time: "3:00 PM" } },
    { dayOffset: 3, item: { id: "m5", title: "Trending sound remix", status: "SCHEDULED", time: "10:00 AM" } },
    { dayOffset: 3, item: { id: "m6", title: "Q&A response", status: "PROCESSING", time: "5:00 PM" } },
    { dayOffset: 5, item: { id: "m7", title: "Collab announcement", status: "SCHEDULED", time: "12:00 PM" } },
    { dayOffset: 6, item: { id: "m8", title: "Weekly recap", status: "DRAFT", time: "4:00 PM" } },
  ];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleCalendar() {
  const days = useMemo<DayColumn[]>(() => {
    const today = new Date();
    const mockItems = generateMockItems();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      return {
        date,
        dayName: DAY_NAMES[date.getDay()],
        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        isToday: i === 0,
        items: mockItems
          .filter((m) => m.dayOffset === i)
          .map((m) => m.item),
      };
    });
  }, []);

  return (
    <div className="rounded-xl bg-bg-secondary border border-border p-4 overflow-x-auto">
      <div className="grid grid-cols-7 gap-2 min-w-[640px]">
        {days.map((day) => (
          <div
            key={day.dateLabel}
            className={cn(
              "rounded-lg p-2 min-h-[140px] border",
              day.isToday
                ? "border-accent-fire bg-accent-fire/5"
                : "border-transparent bg-bg-primary/40"
            )}
          >
            <div className="text-center mb-2">
              <div
                className={cn(
                  "text-xs font-medium",
                  day.isToday ? "text-accent-fire" : "text-text-secondary"
                )}
              >
                {day.dayName}
              </div>
              <div
                className={cn(
                  "text-sm font-bold",
                  day.isToday ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {day.dateLabel}
              </div>
            </div>
            <div className="space-y-1.5">
              {day.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative"
                  title={`${item.title} — ${item.time}`}
                >
                  <div
                    className={cn(
                      "rounded-md px-1.5 py-1 text-[10px] leading-tight font-medium text-white truncate cursor-default",
                      STATUS_COLORS[item.status]
                    )}
                  >
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
