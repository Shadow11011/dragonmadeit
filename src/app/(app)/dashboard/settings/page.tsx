"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { useTypedSession } from "@/hooks/useSession";
import { TIER_CONFIG, PaidTier } from "@/types";
import { cn } from "@/lib/utils";

const PAID_TIERS: PaidTier[] = ["HATCHLING", "DRAKE", "ELDER_DRAGON"];

const TIER_STYLES: Record<PaidTier, { borderColor: string; hoverBorder: string }> = {
  HATCHLING: {
    borderColor: "border-cyan-400/30",
    hoverBorder: "hover:border-cyan-400/60",
  },
  DRAKE: {
    borderColor: "border-accent-ember/30",
    hoverBorder: "hover:border-accent-ember/60",
  },
  ELDER_DRAGON: {
    borderColor: "border-accent-gold/30",
    hoverBorder: "hover:border-accent-gold/60",
  },
};

export default function SettingsPage() {
  const { user, tier, isLoading } = useTypedSession();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const isPaid = tier !== "FREE";

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email: email || undefined }),
      });

      const data: unknown = await res.json();
      if (res.ok) {
        setSaveMessage({ type: "success", text: "Profile updated successfully." });
      } else {
        const errorData = data as { error?: string };
        setSaveMessage({ type: "error", text: errorData.error ?? "Failed to update profile." });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpgrade(selectedTier: string) {
    setCheckoutLoading(selectedTier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier }),
      });

      const data: unknown = await res.json();
      const urlData = data as { url?: string; error?: string };

      if (res.ok && urlData.url) {
        window.location.href = urlData.url;
      } else {
        setSaveMessage({ type: "error", text: urlData.error ?? "Failed to start checkout." });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data: unknown = await res.json();
      const urlData = data as { url?: string; error?: string };

      if (res.ok && urlData.url) {
        window.location.href = urlData.url;
      } else {
        setSaveMessage({ type: "error", text: urlData.error ?? "Failed to open billing portal." });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setPortalLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-bg-secondary rounded-xl" />
          <div className="h-48 bg-bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Save message */}
      {saveMessage && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            saveMessage.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          )}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Profile section */}
      <section className="rounded-xl bg-bg-secondary border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="settings-name" className="block text-sm text-text-secondary mb-1.5">
              Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-bg-primary border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-fire/50 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="block text-sm text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-bg-primary border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-fire/50 transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <Button type="submit" disabled={saving} size="md">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </section>

      {/* Subscription section */}
      <section className="rounded-xl bg-bg-secondary border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Subscription</h2>
          <TierBadge tier={tier} />
        </div>

        {isPaid ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              You are on the <span className="font-medium text-text-primary">{TIER_CONFIG[tier].name}</span> plan
              ({TIER_CONFIG[tier].videosPerWeek} videos/week).
              Manage your subscription, update payment method, or cancel through the billing portal.
            </p>
            <Button
              variant="secondary"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? "Opening..." : "Manage Billing"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              You are on the Free plan. Upgrade to unlock TikTok automation features.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PAID_TIERS.map((tierKey) => {
                const config = TIER_CONFIG[tierKey];
                const styles = TIER_STYLES[tierKey];
                return (
                  <div
                    key={tierKey}
                    className={cn(
                      "rounded-xl border bg-bg-primary p-5 transition-colors",
                      styles.borderColor,
                      styles.hoverBorder
                    )}
                  >
                    <h3 className="font-bold text-lg">{config.name}</h3>
                    <p className="text-2xl font-bold mt-1 fire-text">${config.monthlyPrice}/mo</p>
                    <ul className="mt-4 space-y-2">
                      {config.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mt-0.5 shrink-0 text-success"
                          >
                            <path
                              d="M3 8L6.5 11.5L13 4.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleUpgrade(tierKey)}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === tierKey ? "Redirecting..." : `Upgrade to ${config.name}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
