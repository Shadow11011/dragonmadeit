import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
}

const TIER_STYLES: Record<string, string> = {
  FREE: "bg-text-secondary/10 text-text-secondary",
  HATCHLING: "bg-cyan-400/10 text-cyan-400",
  DRAKE: "bg-accent-ember/10 text-accent-ember",
  ELDER_DRAGON: "bg-accent-gold/10 text-accent-gold",
};

const TIER_LABELS: Record<string, string> = {
  FREE: "Free",
  HATCHLING: "Hatchling",
  DRAKE: "Drake",
  ELDER_DRAGON: "Elder Dragon",
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
