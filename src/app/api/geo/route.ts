import { NextResponse } from "next/server";
import type { Currency } from "@/types";

export async function GET(request: Request) {
  // Vercel automatically sets this header based on the request IP
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ?? // Cloudflare fallback
    null;

  const currency: Currency = country === "NG" ? "NGN" : "USD";

  return NextResponse.json({ country, currency });
}
