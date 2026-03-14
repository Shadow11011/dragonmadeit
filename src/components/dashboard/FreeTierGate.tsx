"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

const EXEMPT_PATHS = ["/dashboard/settings", "/dashboard/accounts"];

/**
 * Gates dashboard content behind account ownership.
 * Users without any TikTok accounts see a prompt to add one.
 * Settings and Accounts pages are always accessible.
 */
export function FreeTierGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [accountCount, setAccountCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/user/accounts/count");
        if (res.ok) {
          const data: unknown = await res.json();
          const countData = data as { count: number };
          setAccountCount(countData.count);
        } else {
          setAccountCount(0);
        }
      } catch {
        setAccountCount(0);
      }
    }
    fetchCount();
  }, []);

  // Show loading state while fetching
  if (accountCount === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  // Always allow access to exempt paths
  const isExempt = EXEMPT_PATHS.some((p) => pathname.startsWith(p));
  if (isExempt || accountCount > 0) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          No TikTok Accounts Yet
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          Add a TikTok account to start automating your content. Choose a plan
          that fits your needs and get posting.
        </p>
      </div>

      <Link href="/dashboard/accounts">
        <Button size="lg">
          Add Your First Account
        </Button>
      </Link>
    </div>
  );
}
