"use client";

import { usePathname } from "next/navigation";
import { useTypedSession } from "@/hooks/useSession";
import { TIER_CONFIG, PaidTier } from "@/types";
import { Button } from "@/components/ui/Button";

const PAID_TIERS: PaidTier[] = ["HATCHLING", "DRAKE", "ELDER_DRAGON"];

const EXEMPT_PATHS = ["/dashboard/settings"];

export function FreeTierGate({ children }: { children: React.ReactNode }) {
  const { tier, isLoading } = useTypedSession();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  const isExempt = EXEMPT_PATHS.some((p) => pathname.startsWith(p));

  if (tier !== "FREE" || isExempt) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8">
        <div className="text-6xl mb-4">&#x1F6A7;</div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Under Maintenance
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          The free dashboard is currently under construction. Upgrade to a paid plan to start automating your TikTok content today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {PAID_TIERS.map((tierKey) => {
          const config = TIER_CONFIG[tierKey];
          return (
            <div
              key={tierKey}
              className="rounded-xl border border-border bg-bg-secondary p-6 text-left hover:border-accent-fire/30 transition-colors"
            >
              <h3 className="font-bold text-lg" style={{ color: config.fireColor }}>
                {config.name}
              </h3>
              <p className="text-2xl font-bold mt-1 fire-text">
                ${config.monthlyPrice}<span className="text-sm text-text-secondary font-normal">/mo</span>
              </p>
              <p className="text-xs text-text-secondary mt-1">{config.description}</p>
              <ul className="mt-4 space-y-1.5">
                {config.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-success mt-0.5">&#x2713;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={`/dashboard/settings`}>
                <Button className="w-full mt-4" size="sm">
                  Upgrade to {config.name}
                </Button>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
