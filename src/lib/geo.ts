"use client";

import { useState, useEffect } from "react";
import type { Currency } from "@/types";

export function useCurrency(): { currency: Currency; loading: boolean } {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data: { currency: Currency }) => {
        setCurrency(data.currency);
      })
      .catch(() => {
        // Default to USD on error
      })
      .finally(() => setLoading(false));
  }, []);

  return { currency, loading };
}
