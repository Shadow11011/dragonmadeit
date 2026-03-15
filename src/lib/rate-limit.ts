import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;
  private checkCount: number;

  constructor(maxRequests: number, windowMs: number) {
    this.store = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.checkCount = 0;
  }

  check(key: string): RateLimitResult {
    this.checkCount++;

    if (this.checkCount % 100 === 0) {
      this.cleanup();
    }

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfter: 0 };
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true, retryAfter: 0 };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

export const authLimiter = new RateLimiter(10, 900_000);
export const webhookLimiter = new RateLimiter(100, 60_000);
export const generalLimiter = new RateLimiter(60, 60_000);

export function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  if (request.ip) {
    return request.ip;
  }

  return "unknown";
}

export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}
