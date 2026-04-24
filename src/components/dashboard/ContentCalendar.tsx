"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type View,
  type EventProps,
} from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { cn } from "@/lib/utils";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ContentItemCalendarItem {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  accountId: string;
  accountUsername: string;
}

export interface ContentCalendarAccount {
  id: string;
  username: string;
}

interface ContentCalendarProps {
  items: ContentItemCalendarItem[];
  accounts: ContentCalendarAccount[];
  onReschedule?: (itemId: string, newStart: Date) => Promise<void>;
  planMode?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  accountId: string;
  accountUsername: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Localizer                                                          */
/* ------------------------------------------------------------------ */

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: enUS }),
  getDay,
  locales,
});

/* ------------------------------------------------------------------ */
/*  Color palette                                                      */
/* ------------------------------------------------------------------ */

// Brand-rooted palette: fire/ember/gold + palette-safe complements.
// Cycled deterministically per account index.
const ACCOUNT_PALETTE = [
  "#ff4500", // accent-fire
  "#ff8c00", // accent-ember
  "#ffd700", // accent-gold
  "#60a5fa", // blue-400
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
  "#f472b6", // pink-400
  "#22d3ee", // cyan-400
  "#fb7185", // rose-400
  "#facc15", // yellow-400
  "#4ade80", // green-400
  "#c084fc", // purple-400
];

function hashToIndex(id: string, modulus: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulus;
}

function colorForAccount(accountId: string): string {
  const idx = hashToIndex(accountId, ACCOUNT_PALETTE.length);
  return ACCOUNT_PALETTE[idx];
}

/* ------------------------------------------------------------------ */
/*  Drag-and-drop wrapper (created once)                               */
/* ------------------------------------------------------------------ */

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

/* ------------------------------------------------------------------ */
/*  Status labels                                                      */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PROCESSING: "Processing",
  POSTED: "Posted",
  FAILED: "Failed",
};

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function CalendarEmptyOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto rounded-xl bg-bg-secondary/80 backdrop-blur-sm border border-border px-6 py-5 text-center shadow-lg">
        <p className="text-text-primary font-medium">No posts scheduled</p>
        <p className="text-text-secondary text-sm mt-1 max-w-xs">
          Posts from your connected accounts will appear here as they&apos;re queued.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event renderer                                                     */
/* ------------------------------------------------------------------ */

function EventInner({ event }: EventProps<CalendarEvent>) {
  return (
    <div className="flex flex-col overflow-hidden text-[11px] leading-tight">
      <span className="font-semibold truncate">{event.title}</span>
      <span className="opacity-80 truncate">@{event.accountUsername}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Popover                                                            */
/* ------------------------------------------------------------------ */

interface PopoverState {
  event: CalendarEvent;
  anchor: { x: number; y: number };
}

function EventPopover({
  state,
  onClose,
}: {
  state: PopoverState;
  onClose: () => void;
}) {
  const { event, anchor } = state;
  const scheduledLabel = event.start.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      {/* Click-away backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed z-50 w-64 rounded-xl bg-bg-secondary border border-border shadow-xl p-4"
        style={{
          top: Math.min(anchor.y + 12, window.innerHeight - 200),
          left: Math.min(anchor.x, window.innerWidth - 272),
        }}
        role="dialog"
      >
        <p className="text-sm font-semibold text-text-primary truncate">
          {event.title}
        </p>
        <dl className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">Status</dt>
            <dd className="text-text-primary font-medium">
              {STATUS_LABEL[event.status] ?? event.status}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">Account</dt>
            <dd className="text-text-primary font-medium truncate">
              @{event.accountUsername}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">When</dt>
            <dd className="text-text-primary font-medium text-right">
              {scheduledLabel}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/dashboard/accounts/${event.accountId}`}
            className="text-xs font-medium text-accent-fire hover:underline"
            onClick={onClose}
          >
            Open account
          </Link>
          <button
            onClick={onClose}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ContentCalendar({
  items,
  accounts,
  onReschedule,
  planMode = false,
}: ContentCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [optimisticOverrides, setOptimisticOverrides] = useState<
    Record<string, Date>
  >({});

  const dragEnabled = planMode && typeof onReschedule === "function";

  // Build account → color map (stable per account list)
  const accountColors = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    accounts.forEach((a, i) => {
      // Prefer positional assignment so each account in the list gets a
      // distinct color in order; fall back to hash for any unknown IDs.
      map[a.id] = ACCOUNT_PALETTE[i % ACCOUNT_PALETTE.length];
    });
    return map;
  }, [accounts]);

  // Map items into calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return items
      .filter((item): item is ContentItemCalendarItem & { scheduledAt: string } =>
        Boolean(item.scheduledAt)
      )
      .map((item) => {
        const overridden = optimisticOverrides[item.id];
        const start = overridden ?? new Date(item.scheduledAt);
        // Default duration: 30 minutes — purely for visual block size
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return {
          id: item.id,
          title: item.title,
          start,
          end,
          accountId: item.accountId,
          accountUsername: item.accountUsername,
          status: item.status,
        };
      });
  }, [items, optimisticOverrides]);

  const eventPropGetter = (event: CalendarEvent) => {
    const color =
      accountColors[event.accountId] ?? colorForAccount(event.accountId);
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: "#0f0d0b",
        fontWeight: 600,
        borderRadius: "6px",
        paddingLeft: "6px",
        paddingRight: "6px",
      },
    };
  };

  const handleEventDrop: withDragAndDropProps<CalendarEvent>["onEventDrop"] = async ({
    event,
    start,
  }) => {
    if (!onReschedule) return;
    const newStart = start instanceof Date ? start : new Date(start);

    // Optimistic update
    const prev = optimisticOverrides[event.id];
    setOptimisticOverrides((o) => ({ ...o, [event.id]: newStart }));
    try {
      await onReschedule(event.id, newStart);
    } catch (err) {
      // Roll back
      setOptimisticOverrides((o) => {
        const next = { ...o };
        if (prev) next[event.id] = prev;
        else delete next[event.id];
        return next;
      });
      const message =
        err instanceof Error ? err.message : "Failed to reschedule";
      // Minimal user feedback without adding a toast library
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  };

  const handleSelectEvent = (
    event: CalendarEvent,
    syntheticEvent: React.SyntheticEvent<HTMLElement>
  ) => {
    const mouse = syntheticEvent as unknown as React.MouseEvent<HTMLElement>;
    setPopover({
      event,
      anchor: { x: mouse.clientX ?? 0, y: mouse.clientY ?? 0 },
    });
  };

  const showEmptyOverlay = events.length === 0;

  const calendarClass = cn(
    "rbc-dragon relative rounded-xl bg-bg-secondary border border-border p-3",
    // Min height so the calendar always has presence even when empty
    "min-h-[560px]"
  );

  const commonProps = {
    localizer,
    events,
    startAccessor: "start" as const,
    endAccessor: "end" as const,
    views: [Views.MONTH, Views.WEEK, Views.DAY],
    view,
    date,
    onView: (v: View) => setView(v),
    onNavigate: (d: Date) => setDate(d),
    defaultView: Views.MONTH,
    eventPropGetter,
    onSelectEvent: handleSelectEvent,
    popup: true,
    components: {
      event: EventInner,
    },
    style: { height: 560 },
  };

  return (
    <div className={calendarClass}>
      {dragEnabled ? (
        <DnDCalendar
          {...commonProps}
          draggableAccessor={() => true}
          resizable={false}
          onEventDrop={handleEventDrop}
        />
      ) : (
        <Calendar<CalendarEvent> {...commonProps} />
      )}

      {showEmptyOverlay && <CalendarEmptyOverlay />}

      {popover && (
        <EventPopover state={popover} onClose={() => setPopover(null)} />
      )}
    </div>
  );
}
