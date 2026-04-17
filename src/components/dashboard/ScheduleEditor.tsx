"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { PostingSchedule } from "@/types";

interface ScheduleEditorProps {
  accountId: string;
  videosPerWeek: number;
  initial: PostingSchedule | null;
  onSaved?: (schedule: PostingSchedule, nextPostAt: string | null) => void;
  onCancel?: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

const WEEKDAYS: Array<{ num: number; label: string }> = [
  { num: 1, label: "Mon" },
  { num: 2, label: "Tue" },
  { num: 3, label: "Wed" },
  { num: 4, label: "Thu" },
  { num: 5, label: "Fri" },
  { num: 6, label: "Sat" },
  { num: 0, label: "Sun" },
];

export function ScheduleEditor({
  accountId,
  videosPerWeek,
  initial,
  onSaved,
  onCancel,
}: ScheduleEditorProps) {
  const [days, setDays] = useState<number[]>(initial?.days ?? []);
  const [times, setTimes] = useState<string[]>(initial?.times ?? ["09:00"]);
  // All schedules run on UTC so there's no ambiguity across users / servers.
  const timezone = "UTC";
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const needsMultiplePerDay = videosPerWeek > 7;
  const requiredDays = useMemo(
    () => (needsMultiplePerDay ? 7 : Math.max(1, videosPerWeek)),
    [needsMultiplePerDay, videosPerWeek],
  );
  const requiredTimes = useMemo(
    () => (needsMultiplePerDay ? Math.ceil(videosPerWeek / 7) : 1),
    [needsMultiplePerDay, videosPerWeek],
  );

  const toggleDay = useCallback(
    (dayNum: number) => {
      setSaveStatus("idle");
      setError(null);
      setDays((prev) => {
        if (prev.includes(dayNum)) {
          return prev.filter((d) => d !== dayNum).sort((a, b) => a - b);
        }
        if (prev.length >= requiredDays) {
          setError(
            `Your tier only allows ${requiredDays} posting day${requiredDays === 1 ? "" : "s"}. Remove one first.`,
          );
          return prev;
        }
        return [...prev, dayNum].sort((a, b) => a - b);
      });
    },
    [requiredDays],
  );

  const updateTime = useCallback((idx: number, value: string) => {
    setSaveStatus("idle");
    setTimes((prev) => {
      const next = [...prev];
      while (next.length <= idx) next.push("");
      next[idx] = value;
      return next;
    });
  }, []);

  const addTime = useCallback(() => {
    setSaveStatus("idle");
    setTimes((prev) => [...prev, "12:00"]);
  }, []);

  const removeTime = useCallback((idx: number) => {
    setSaveStatus("idle");
    setTimes((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const canSave = days.length >= requiredDays && times.filter(Boolean).length >= requiredTimes;

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setError(null);
    try {
      const res = await fetch(`/api/tiktok-accounts/${accountId}/schedule`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          days,
          times: times.filter((t) => /^\d{2}:\d{2}$/.test(t)),
          timezone,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { schedule?: PostingSchedule; nextPostAt?: string | null };
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to save schedule");
      }
      setSaveStatus("success");
      onSaved?.(
        data.data?.schedule ?? { days, times, timezone },
        data.data?.nextPostAt ?? null,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save schedule");
      setSaveStatus("error");
    }
  }, [accountId, days, times, timezone, onSaved]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">
          Posting Days ({days.length}/{requiredDays})
        </p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map(({ num, label }) => {
            const selected = days.includes(num);
            return (
              <button
                key={num}
                type="button"
                onClick={() => toggleDay(num)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  selected
                    ? "bg-accent-fire text-white"
                    : "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/70",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">
          Posting Time{requiredTimes > 1 ? "s" : ""} ({times.filter(Boolean).length}/{requiredTimes})
        </p>
        <div className="space-y-2">
          {times.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="time"
                value={t}
                onChange={(e) => updateTime(idx, e.target.value)}
                className="rounded-md bg-bg-tertiary border border-border px-3 py-1.5 text-sm text-text-primary"
              />
              {times.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTime(idx)}
                  className="text-xs text-text-secondary hover:text-accent-fire"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {times.length < requiredTimes && (
            <button
              type="button"
              onClick={addTime}
              className="text-xs text-accent-fire hover:underline"
            >
              + Add another time
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        Times are in <span className="text-text-primary font-medium">UTC</span>.
      </p>

      {error && <p className="text-sm text-error">{error}</p>}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2"
      >
        <Button
          variant="primary"
          size="sm"
          disabled={!canSave || saveStatus === "saving"}
          onClick={() => void handleSave()}
        >
          {saveStatus === "saving" ? "Saving…" : "Save schedule"}
        </Button>
        {onCancel && (
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {saveStatus === "success" && (
          <span className="text-sm text-success">Saved.</span>
        )}
      </motion.div>
    </div>
  );
}
