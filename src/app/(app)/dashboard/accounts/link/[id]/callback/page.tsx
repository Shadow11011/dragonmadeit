"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DragonMascot } from "@/components/dashboard/DragonMascot";

type LinkStatus = "loading" | "success" | "error";

interface LinkResponse {
  success: boolean;
  error?: string;
}

export default function TikTokOAuthCallbackPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<LinkStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const connected = searchParams.get("connected");
    const accountId = searchParams.get("accountId");
    const username = searchParams.get("username");

    if (connected !== "tiktok" || !accountId || !username) {
      setStatus("error");
      setErrorMessage(
        "Invalid callback parameters. Please try linking your TikTok account again."
      );
      return;
    }

    async function linkAccount(lateAccountId: string, tiktokUsername: string) {
      try {
        const response = await fetch(
          `/api/tiktok-accounts/${params.id}/link`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: tiktokUsername,
              lateAccountId,
            }),
          }
        );

        const data: LinkResponse = (await response.json()) as LinkResponse;

        if (!response.ok || !data.success) {
          setStatus("error");
          setErrorMessage(data.error ?? "Failed to link TikTok account.");
          return;
        }

        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard/accounts?linked=true");
        }, 2000);
      } catch {
        setStatus("error");
        setErrorMessage(
          "An unexpected error occurred. Please try again."
        );
      }
    }

    void linkAccount(accountId, username);
  }, [params.id, searchParams, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-xl border border-border bg-bg-secondary p-8 text-center"
      >
        <div className="mb-6 flex justify-center">
          <DragonMascot
            size={56}
            color={
              status === "success"
                ? "#22c55e"
                : status === "error"
                  ? "#ef4444"
                  : "#ff4500"
            }
          />
        </div>

        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-fire" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Connecting your TikTok account...
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Please wait while we finalize the connection.
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="mb-4 flex justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="22" stroke="#22c55e" strokeWidth="2.5" fill="none" />
                <motion.path
                  d="M14 24L21 31L34 18"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-success">
              TikTok account connected!
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Redirecting you to your accounts...
            </p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="22" stroke="#ef4444" strokeWidth="2.5" fill="none" />
                <path
                  d="M17 17L31 31M31 17L17 31"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-error">
              Connection failed
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push("/dashboard/accounts")}
              className="mt-6 rounded-lg bg-accent-fire px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-fire/90"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
