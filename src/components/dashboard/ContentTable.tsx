"use client";

import { cn } from "@/lib/utils";

type ContentStatusValue = "DRAFT" | "SCHEDULED" | "PROCESSING" | "POSTED" | "FAILED";

interface ContentTableItem {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  tiktokAccountUsername?: string;
}

interface ContentTableProps {
  items: ContentTableItem[];
}

const STATUS_BADGE: Record<ContentStatusValue, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-text-secondary/20", text: "text-text-secondary", label: "Draft" },
  SCHEDULED: { bg: "bg-accent-ember/20", text: "text-accent-ember", label: "Scheduled" },
  PROCESSING: { bg: "bg-warning/20", text: "text-warning", label: "Processing" },
  POSTED: { bg: "bg-success/20", text: "text-success", label: "Posted" },
  FAILED: { bg: "bg-error/20", text: "text-error", label: "Failed" },
};

function isContentStatus(value: string): value is ContentStatusValue {
  return ["DRAFT", "SCHEDULED", "PROCESSING", "POSTED", "FAILED"].includes(value);
}

function StatusBadge({ status }: { status: string }) {
  const badge = isContentStatus(status)
    ? STATUS_BADGE[status]
    : STATUS_BADGE.DRAFT;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        badge.bg,
        badge.text
      )}
    >
      {badge.label}
    </span>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ContentTable({ items }: ContentTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-bg-secondary border border-border p-8 text-center">
        <p className="text-text-secondary">No content yet. Create your first post!</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl bg-bg-secondary border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Title
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Account
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Scheduled
              </th>
              <th className="text-right text-xs font-medium text-text-secondary px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border/50 last:border-0 hover:bg-bg-tertiary/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-sm">{item.title}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {item.tiktokAccountUsername ? `@${item.tiktokAccountUsername}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {formatDate(item.scheduledAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-bg-secondary border border-border p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>
                {item.tiktokAccountUsername ? `@${item.tiktokAccountUsername}` : "No account"}
              </span>
              <span>{formatDate(item.scheduledAt)}</span>
            </div>
            <div className="flex justify-end">
              <button className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
