import { randomInt, createHash } from "crypto";

export const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_ATTEMPTS = 5;

export function generateCode(): string {
  return randomInt(100000, 999999).toString();
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}
