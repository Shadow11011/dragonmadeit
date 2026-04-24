import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
}

const TIER_STYLES: Record<string, string> = {
  FREE: "bg-text-secondary/10 text-text-secondary",
  SCHEDULER: "bg-[#4fb0c6]/10 text-[#4fb0c6]",
  CREATOR: "bg-[#c87533]/10 text-[#c87533]",
  CLIPPER: "bg-[#ff8c00]/10 text-[#ff8c00]",
  STUDIO: "bg-accent-ember/10 text-accent-ember",
  STUDIO_PRO: "bg-accent-gold/10 text-accent-gold",
  AGENCY: "bg-accent-gold/10 text-accent-gold",
};

const TIER_LABELS: Record<string, string> = {
  FREE: "Free",
  SCHEDULER: "Scheduler",
  CREATOR: "Creator",
  CLIPPER: "Clipper",
  STUDIO: "Studio",
  STUDIO_PRO: "Studio Pro",
  AGENCY: "Agency",
};

export function TierBadge({ tier }: TierBadgeProps) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.FREE;
  const label = TIER_LABELS[tier] ?? tier;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style
      )}
    >
      {label}
    </span>
  );
}
