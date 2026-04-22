"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const VALID_TIER_PARAMS = new Set([
  "free",
  "hatchling",
  "drake",
  "elder_dragon",
]);

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // If the landing page (or pricing page) linked us here with ?tier=<slug>,
  // take the user straight into the account wizard with that tier preselected
  // after they verify. Otherwise honour any explicit ?callbackUrl.
  const tierParam = searchParams.get("tier")?.toLowerCase() ?? null;
  const callbackUrl =
    tierParam && VALID_TIER_PARAMS.has(tierParam)
      ? `/dashboard/accounts/add?tier=${tierParam}`
      : searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Store pending data for the verify page
      sessionStorage.setItem(
        "pendingSignup",
        JSON.stringify({ email, password, name, callbackUrl })
      );

      router.push("/signup/verify");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold font-heading fire-text">DragonMadeIt</h1>
        </Link>
        <p className="mt-2 text-text-secondary">Create your account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4"
      >
        {error && (
          <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm text-text-secondary mb-1.5">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-fire/50 transition-colors"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-fire/50 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-fire/50 transition-colors"
            placeholder="Min. 8 characters"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Please wait..." : "Create Account"}
        </Button>

        <p className="text-center text-xs text-text-secondary">
          14-day money-back guarantee. Cancel anytime.
        </p>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-fire hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
