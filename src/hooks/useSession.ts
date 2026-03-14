"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import { Tier } from "@prisma/client";

export function useTypedSession() {
  const { data: session, status, update } = useNextAuthSession();

  return {
    user: session?.user ?? null,
    tier: (session?.user?.tier as Tier) ?? "FREE",
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    onboardingComplete: session?.user?.onboardingComplete ?? false,
    update,
  };
}
