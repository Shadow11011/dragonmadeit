"use client";

import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center space-y-4">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-error"
      >
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M32 18V36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="44" r="2" fill="currentColor" />
      </svg>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-text-secondary max-w-md">
        {error.message || "An unexpected error occurred. We can try again."}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
