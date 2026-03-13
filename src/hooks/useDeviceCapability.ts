"use client";

import { useState, useEffect } from "react";

interface DeviceCapability {
  tier: "high" | "medium" | "low";
  isMobile: boolean;
  hasWebGL: boolean;
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return gl !== null;
  } catch {
    return false;
  }
}

function detectCapability(): DeviceCapability {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

  const hasWebGL = checkWebGL();

  if (!hasWebGL) {
    return { tier: "low", isMobile, hasWebGL };
  }

  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const screenArea = window.screen.width * window.screen.height;

  let score = 0;

  // Core count scoring
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;

  // Memory scoring (if available)
  if (memory !== undefined) {
    if (memory >= 8) score += 3;
    else if (memory >= 4) score += 2;
    else score += 1;
  } else {
    // Assume decent if not available (usually desktop)
    score += 2;
  }

  // Screen size scoring
  if (screenArea >= 1920 * 1080) score += 2;
  else if (screenArea >= 1280 * 720) score += 1;

  // Mobile penalty
  if (isMobile) score -= 1;

  let tier: "high" | "medium" | "low";
  if (score >= 6) tier = "high";
  else if (score >= 4) tier = "medium";
  else tier = "low";

  return { tier, isMobile, hasWebGL };
}

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>({
    tier: "medium",
    isMobile: false,
    hasWebGL: false,
  });

  useEffect(() => {
    setCapability(detectCapability());
  }, []);

  return capability;
}
