/**
 * Client-side device fingerprint. Produces a SHA-256 hex digest of stable,
 * entropy-rich browser/hardware signals. Not anti-abuse bulletproof (a
 * determined attacker with multiple browsers + VMs still wins), but enough
 * to raise the cost of farming thousands of free accounts from one box.
 *
 * Browser-only. Server code must not import this file.
 */

async function canvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-ctx";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("DragonMadeIt—fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillText("DragonMadeIt—fingerprint", 4, 17);
    return canvas.toDataURL();
  } catch {
    return "canvas-err";
  }
}

function webglFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "no-webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "no-ext";
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string | null;
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string | null;
    return `${vendor ?? ""}|${renderer ?? ""}`;
  } catch {
    return "webgl-err";
  }
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function collectDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server-side";

  const nav = window.navigator;
  const screen = window.screen;

  const signals = [
    nav.userAgent,
    nav.language,
    (nav.languages ?? []).join(","),
    String(nav.hardwareConcurrency ?? ""),
    String((nav as Navigator & { deviceMemory?: number }).deviceMemory ?? ""),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(window.devicePixelRatio ?? ""),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    new Date().getTimezoneOffset().toString(),
    webglFingerprint(),
    await canvasFingerprint(),
    // Platform — not in navigator.userAgent on all UAs
    (nav as Navigator & { platform?: string }).platform ?? "",
    // Touch points (separates phone/tablet/desktop classes)
    String(nav.maxTouchPoints ?? ""),
  ].join("||");

  return sha256Hex(signals);
}
