import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TrendProps {
  value: number;
  isPositive: boolean;
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: TrendProps;
  accentColor?: string;
}

export function StatsCard({ label, value, icon, trend, accentColor }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-bg-secondary border border-border p-5"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-lg"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {icon}
        </span>
        <span className="font-heading text-xs text-text-secondary">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium mb-0.5",
              trend.isPositive ? "text-success" : "text-error"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
