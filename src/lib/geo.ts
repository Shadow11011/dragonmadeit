"use client";

import type { Currency } from "@/types";

export function useCurrency(): { currency: Currency; loading: boolean } {
  return { currency: "USD", loading: false };
}
