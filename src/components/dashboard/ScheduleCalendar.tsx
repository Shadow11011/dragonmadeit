"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

type ContentStatusValue = "DRAFT" | "SCHEDULED" | "PROCESSING" | "POSTED" | "FAILED";

interface CalendarItem {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
}

interface DayColumn {
  date: Date;
  dayName: string;
  dateLabel: string;
  isToday: boolean;
  items: Array<{
    id: string;
    title: string;
    status: ContentStatusValue;
    time: string;
  }>;
}

interface ScheduleCalendarProps {
  items: CalendarItem[];
}

const STATUS_COLORS: Record<ContentStatusValue, string> = {
  DRAFT: "bg-text-secondary",
  SCHEDULED: "bg-blue-500",
  PROCESSING: "bg-warning",
  POSTED: "bg-success",
  FAILED: "bg-error",
};

function isContentStatus(value: string): value is ContentStatusValue {
  return ["DRAFT", "SCHEDULED", "PROCESSING", "POSTED", "FAILED"].includes(value);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleCalendar({ items }: ScheduleCalendarProps) {
  const days = useMemo<DayColumn[]>(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayItems = items
        .filter((item) => {
          if (!item.scheduledAt) return false;
          const scheduled = new Date(item.scheduledAt);
          return isSameDay(scheduled, date);
        })
        .map((item) => ({
          id: item.id,
          title: item.title,
          status: isContentStatus(item.status) ? item.status : ("DRAFT" as ContentStatusValue),
          time: item.scheduledAt ? formatTime(item.scheduledAt) : "",
        }))
        .sort((a, b) => a.time.localeCompare(b.time));

      return {
        date,
        dayName: DAY_NAMES[date.getDay()],
        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        isToday: i === 0,
        items: dayItems,
      };
    });
  }, [items]);

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
              {day.items.length === 0 ? (
                <p className="text-[10px] text-text-secondary/50 text-center mt-4">
                  No posts
                </p>
              ) : (
                day.items.map((item) => (
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
                      <span className="opacity-70 mr-1">{item.time}</span>
                      {item.title}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
