"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DragonMascot } from "@/components/dashboard/DragonMascot";

export default function LinkAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = username.trim().length >= 2;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tiktok-accounts/${accountId}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().replace(/^@/, "") }),
      });

      const data: unknown = await res.json();

      if (res.ok) {
        router.push("/dashboard/accounts?linked=true");
      } else {
        const errData = data as { error?: string };
        setError(errData.error ?? "Failed to link account. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link
          href="/dashboard/accounts"
          className="hover:text-text-primary transition-colors"
        >
          Accounts
        </Link>
        <span>/</span>
        <span className="text-text-primary">Link TikTok Account</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-bg-secondary border border-border p-8"
      >
        {/* Header with mascot */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <DragonMascot size={56} color="#ff4500" />
          </div>
          <h1 className="text-2xl font-bold">Link Your TikTok Account</h1>
          <p className="text-text-secondary text-sm mt-2">
            Enter your TikTok username to connect it to your subscription.
            This is the account that will receive automated posts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <div>
            <label
              htmlFor="tiktok-username"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              TikTok Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                @
              </span>
              <input
                id="tiktok-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                autoFocus
                autoComplete="off"
                className="w-full rounded-lg bg-bg-primary border border-border pl-8 pr-3 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-fire/50 transition-colors"
              />
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Enter your TikTok username without the @ symbol. Example:{" "}
              <span className="text-text-primary">yourbrand</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/dashboard/accounts" className="flex-1">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={isSubmitting}
              >
                Skip for Now
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 fire-gradient text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Linking...
                </span>
              ) : (
                "Link Account"
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-xs text-text-secondary">
          Need help finding your username? Open TikTok, go to your profile, and
          copy the username shown at the top.
        </p>
      </div>
    </div>
  );
}
