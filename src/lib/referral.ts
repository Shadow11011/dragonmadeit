import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// Crockford-ish base32: removed 0/O, 1/I/L to avoid ambiguous characters.
// 31 symbols — close enough to 32 that we don't lose meaningful entropy, and
// every code is human-readable.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;

/**
 * Generate an 8-char referral code using crypto.randomBytes.
 * Not cryptographically critical (these are opaque public handles, not secrets)
 * but we still use CSPRNG entropy to avoid predictable codes and limit
 * enumeration by curious users.
 */
export function generateReferralCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/**
 * Generate a unique referral code by probing the DB for collisions.
 * Retries up to `maxAttempts` times. At 31^8 ≈ 8.5e11 codes and a user count
 * comfortably under six figures, collisions are vanishingly rare; this exists
 * only as a defense-in-depth guard against a bad dice roll.
 */
export async function generateUniqueReferralCode(
  maxAttempts = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateReferralCode();
    const existing = await prisma.user.findUnique({
      where: { referralCode: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("Failed to generate a unique referral code");
}

/**
 * Atomically increment a user's referral credit balance (stored in cents).
 * Wrapped in a transaction with SELECT ... FOR UPDATE semantics so two
 * concurrent writers never lose an increment.
 */
export async function applyReferralCredit(
  userId: string,
  amountCents: number
): Promise<void> {
  if (amountCents <= 0) return;
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { referralCredits: { increment: amountCents } },
    });
  });
}

/**
 * Resolve a referral code to a user id. Returns null for unknown/invalid codes
 * so the caller (signup) can silently no-op when a visitor arrived with a
 * bogus ?ref=.
 */
export async function resolveReferralCode(
  code: string | null | undefined
): Promise<string | null> {
  if (!code) return null;
  const trimmed = code.trim().toUpperCase();
  // Cheap shape-check before hitting the DB.
  if (trimmed.length !== CODE_LENGTH) return null;
  if (!/^[A-Z0-9]+$/.test(trimmed)) return null;
  const user = await prisma.user.findUnique({
    where: { referralCode: trimmed },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Build the public-facing referral URL for a given code.
 * Honors NEXT_PUBLIC_APP_URL, otherwise falls back to the production domain.
 */
export function buildReferralUrl(code: string): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "https://dragonmadeit.app"
  ).replace(/\/+$/, "");
  return `${base}/signup?ref=${code}`;
}

/**
 * Format a credits-in-cents integer as a USD display string, e.g. 1000 -> "$10.00".
 */
export function formatCreditsDisplay(amountCents: number): string {
  const dollars = (amountCents / 100).toFixed(2);
  return `$${dollars}`;
}
