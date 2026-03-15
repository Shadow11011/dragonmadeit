import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  authLimiter,
  webhookLimiter,
  generalLimiter,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Rate limiting for API routes ---
  if (pathname.startsWith("/api/")) {
    const key = getRateLimitKey(request);

    let result;
    if (pathname.startsWith("/api/auth/")) {
      result = authLimiter.check(key);
    } else if (pathname.startsWith("/api/webhooks/")) {
      result = webhookLimiter.check(key);
    } else {
      result = generalLimiter.check(key);
    }

    if (!result.allowed) {
      return rateLimitResponse(result.retryAfter);
    }
  }

  // --- Auth checks for protected routes ---
  const needsAuth =
    pathname.startsWith("/dashboard/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/api/user/") ||
    pathname.startsWith("/api/stripe/") ||
    pathname.startsWith("/api/tiktok-accounts/");

  if (needsAuth) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
