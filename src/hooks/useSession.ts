"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useTypedSession() {
  const { data: session, status, update } = useNextAuthSession();

  return {
    user: session?.user ?? null,
    hasActiveSubscription: session?.user?.hasActiveSubscription ?? false,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    update,
  };
}
