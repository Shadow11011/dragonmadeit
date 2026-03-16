"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DragonMascot } from "@/components/dashboard/DragonMascot";

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
      <div className="flex justify-center mb-4">
        <DragonMascot size={64} color="#ff4500" />
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Ready to start posting?
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          Pick a plan, choose your content style, and let your dragon handle the rest.
        </p>
      </div>

      <Link href="/dashboard/accounts">
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#ff4500] to-[#ff8c00] text-white shadow-[0_0_20px_rgba(255,69,0,0.3)]"
        >
          Add Your First Account
        </Button>
      </Link>
    </div>
  );
}
