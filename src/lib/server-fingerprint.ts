import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * Server-side request signals to complement the client-provided device hash.
 * Returns two separate hashes so we can log both and decide policy per signal:
 * - `ipHash`: IP only, salted. Soft-signal: a shared NAT or coffee shop can share this.
 * - `uaHash`: User-agent + accept-language + sec-ch-ua hints. Harder to spoof
 *   without matching browser, still less unique than the client fingerprint.
 *
 * Both are SHA-256 hex. Use the env var `FINGERPRINT_SALT` if you want stable
 * hashes that survive process restarts; otherwise a per-deploy-random salt is
 * fine because we only ever compare within a single dataset.
 */
const SALT = process.env.FINGERPRINT_SALT ?? "dragonmadeit-default-salt";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function getRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  if (request.ip) return request.ip;
  return "unknown";
}

export interface ServerFingerprint {
  ipHash: string;
  uaHash: string;
  ipRaw: string; // raw IP for logging only — do not return to client
}

export function getServerFingerprint(request: NextRequest): ServerFingerprint {
  const ip = getRequestIp(request);
  const ua = request.headers.get("user-agent") ?? "";
  const lang = request.headers.get("accept-language") ?? "";
  const secUa = request.headers.get("sec-ch-ua") ?? "";
  const secPlatform = request.headers.get("sec-ch-ua-platform") ?? "";

  return {
    ipHash: sha256(`${SALT}|ip|${ip}`),
    uaHash: sha256(`${SALT}|ua|${ua}|${lang}|${secUa}|${secPlatform}`),
    ipRaw: ip,
  };
}
