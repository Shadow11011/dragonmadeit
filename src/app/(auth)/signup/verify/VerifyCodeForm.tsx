"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const CODE_EXPIRY_SECONDS = 10 * 60;

export default function VerifyCodeForm() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [timeLeft, setTimeLeft] = useState(CODE_EXPIRY_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Read pending signup data from sessionStorage
  const getPendingData = useCallback(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("pendingSignup");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        email: string;
        password: string;
        name?: string;
      };
    } catch {
      return null;
    }
  }, []);

  // Redirect if no pending data
  useEffect(() => {
    if (!getPendingData()) {
      router.replace("/signup");
    }
  }, [getPendingData, router]);

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) return;

    const pending = getPendingData();
    if (!pending) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pending.email, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      // Account created — sign in
      const result = await signIn("credentials", {
        email: pending.email,
        password: pending.password,
        redirect: false,
      });

      sessionStorage.removeItem("pendingSignup");

      if (result?.error) {
        // Account was created but sign-in failed — send to login
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    const pending = getPendingData();
    if (!pending || resendCooldown > 0) return;

    try {
      await fetch("/api/auth/signup/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      });
      setResendCooldown(RESEND_COOLDOWN);
      setTimeLeft(CODE_EXPIRY_SECONDS);
      setDigits(Array(CODE_LENGTH).fill(""));
      setError("");
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code.");
    }
  }

  const pending = getPendingData();
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold fire-text">DragonMadeIt</h1>
        </Link>
        <p className="mt-2 text-text-secondary">Verify your email</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-secondary border border-border rounded-xl p-6 space-y-5"
      >
        <p className="text-sm text-text-secondary text-center">
          We sent a 6-digit code to{" "}
          <span className="text-text-primary font-medium">
            {pending?.email ?? "your email"}
          </span>
        </p>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Code input */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-bold bg-bg-primary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-fire/50 transition-colors"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Timer */}
        <p className="text-center text-xs text-text-secondary">
          {timeLeft > 0 ? (
            <>
              Code expires in{" "}
              <span className="text-accent-ember font-medium">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </>
          ) : (
            <span className="text-error">Code expired. Please request a new one.</span>
          )}
        </p>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || digits.join("").length !== CODE_LENGTH}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-accent-fire hover:underline disabled:text-text-secondary disabled:no-underline"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
          </button>
        </p>

        <p className="text-center text-sm text-text-secondary">
          <Link href="/signup" className="text-accent-fire hover:underline">
            Back to Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
