"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DragonMascot } from "@/components/dashboard/DragonMascot";

export default function LinkAccountPage() {
  const params = useParams();
  const accountId = params.id as string;

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setIsConnecting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tiktok-accounts/${accountId}/connect`, {
        method: "POST",
      });

      const data: unknown = await res.json();

      if (res.ok) {
        const result = data as { success: boolean; data: { authUrl: string } };
        window.location.href = result.data.authUrl;
      } else {
        const errData = data as { error?: string };
        setError(
          errData.error ?? "Failed to start TikTok connection. Please try again."
        );
        setIsConnecting(false);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsConnecting(false);
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
        <span className="text-text-primary">Connect TikTok Account</span>
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
            <DragonMascot size={56} />
          </div>
          <h1 className="text-2xl font-bold">Connect Your TikTok Account</h1>
          <p className="text-text-secondary text-sm mt-2">
            Click below to securely connect your TikTok account through
            TikTok&apos;s authorization page. We&apos;ll never see your TikTok
            password.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error mb-6">
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
              disabled={isConnecting}
            >
              Skip for Now
            </Button>
          </Link>
          <Button
            type="button"
            onClick={() => void handleConnect()}
            disabled={isConnecting}
            className="flex-1 fire-gradient text-white"
          >
            {isConnecting ? (
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
                Connecting...
              </span>
            ) : (
              "Connect with TikTok"
            )}
          </Button>
        </div>
      </motion.div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-xs text-text-secondary">
          You&apos;ll be redirected to TikTok to authorize access. This allows
          us to post content on your behalf using your configured schedule.
        </p>
      </div>
    </div>
  );
}
