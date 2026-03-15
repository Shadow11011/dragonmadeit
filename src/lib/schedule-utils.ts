import type { PostingSchedule } from "@/types";

/**
 * Converts a 24h "HH:MM" string to a 12h display like "2:00 PM".
 */
export function formatTimeDisplay(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
}

/**
 * Returns the next Date that matches one of the scheduled days and times.
 * Returns null if the schedule is empty or null.
 */
export function getNextPostTime(schedule: PostingSchedule | null): Date | null {
  if (!schedule || schedule.days.length === 0 || schedule.times.length === 0) {
    return null;
  }

  const now = new Date();
  const sortedTimes = [...schedule.times].sort();
  const scheduledDays = new Set(schedule.days);

  // Build a formatter to get the current time in the schedule's timezone
  const tzFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: schedule.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = tzFormatter.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const nowHour = parseInt(get("hour"), 10);
  const nowMinute = parseInt(get("minute"), 10);
  const nowTotalMinutes = nowHour * 60 + nowMinute;

  // We'll scan up to 8 days ahead (today + 7) to find the next match
  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const candidate = new Date(now.getTime() + dayOffset * 86_400_000);
    const candidateParts = tzFormatter.formatToParts(candidate);
    const getCandidate = (type: Intl.DateTimeFormatPartTypes): string =>
      candidateParts.find((p) => p.type === type)?.value ?? "0";

    // Determine the day of week in the target timezone
    const dayOfWeekFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: schedule.timezone,
      weekday: "short",
    });
    const weekdayStr = dayOfWeekFormatter.format(candidate);
    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const candidateDow = dayMap[weekdayStr];

    if (candidateDow === undefined || !scheduledDays.has(candidateDow)) {
      continue;
    }

    // Check each time slot on this day
    for (const time of sortedTimes) {
      const [hStr, mStr] = time.split(":");
      const slotHour = parseInt(hStr, 10);
      const slotMinute = parseInt(mStr, 10);
      const slotTotalMinutes = slotHour * 60 + slotMinute;

      // If it's today, skip times that have already passed
      if (dayOffset === 0 && slotTotalMinutes <= nowTotalMinutes) {
        continue;
      }

      // Build the target date in the schedule timezone.
      // Use the candidate's date parts with the slot time.
      const year = parseInt(getCandidate("year"), 10);
      const month = parseInt(getCandidate("month"), 10);
      const day = parseInt(getCandidate("day"), 10);

      // Construct an ISO-ish string and resolve via the timezone
      const isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(slotHour).padStart(2, "0")}:${String(slotMinute).padStart(2, "0")}:00`;

      // Use a round-trip through the timezone to get the correct UTC instant
      const targetDate = buildDateInTimezone(isoString, schedule.timezone);
      return targetDate;
    }
  }

  return null;
}

/**
 * Builds a Date representing the given local datetime string in the specified timezone.
 */
function buildDateInTimezone(localIso: string, timezone: string): Date {
  // Parse the local components
  const [datePart, timePart] = localIso.split("T");
  const [yearStr, monthStr, dayStr] = datePart.split("-");
  const [hourStr, minuteStr, secondStr] = timePart.split(":");

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const second = parseInt(secondStr, 10);

  // Start with a UTC guess
  const utcGuess = new Date(Date.UTC(year, month, day, hour, minute, second));

  // Find the offset between our guess and what that UTC time looks like in the timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);

  const tzYear = get("year");
  const tzMonth = get("month") - 1;
  const tzDay = get("day");
  const tzHour = get("hour") === 24 ? 0 : get("hour");
  const tzMinute = get("minute");
  const tzSecond = get("second");

  const tzAsUtc = new Date(
    Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond)
  );
  const offsetMs = tzAsUtc.getTime() - utcGuess.getTime();

  // Adjust: the real UTC time is our guess minus the offset
  return new Date(utcGuess.getTime() - offsetMs);
}

/**
 * Returns a human-readable countdown string.
 * - Under 24h: "2h 15m"
 * - Under 7 days: "Tomorrow at 2:00 PM" or "Wed at 7:00 PM"
 * - 7+ days: "Mar 15 at 7:00 PM"
 */
export function formatCountdown(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Now";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  // Less than 24 hours
  if (diffHours < 24) {
    if (diffHours === 0) {
      return `${remainingMinutes}m`;
    }
    return `${diffHours}h ${remainingMinutes}m`;
  }

  const timeStr = formatTime12h(targetDate);

  // Less than 7 days
  if (diffHours < 168) {
    // Check if it's tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (isSameDay(targetDate, tomorrow)) {
      return `Tomorrow at ${timeStr}`;
    }

    const dayName = targetDate.toLocaleDateString("en-US", {
      weekday: "short",
    });
    return `${dayName} at ${timeStr}`;
  }

  // 7+ days
  const monthDay = targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${monthDay} at ${timeStr}`;
}

function formatTime12h(date: Date): string {
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
