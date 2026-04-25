import Image from "next/image";

interface DragonMascotProps {
  size?: number;
  /** Retained for backwards compatibility with legacy callers; no longer used. */
  color?: string;
}

/**
 * Static monochrome dragon mark. Was previously an animated SVG mascot;
 * rebranded to a flat brand emblem for a mature SaaS feel.
 */
export function DragonMascot({ size = 32 }: DragonMascotProps) {
  // Pick the closest pre-rendered asset for sharpness.
  const src =
    size <= 32
      ? "/images/brand/dragonmark-light-32.png"
      : size <= 64
        ? "/images/brand/dragonmark-light-64.png"
        : "/images/brand/dragonmark-light-256.png";

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      aria-hidden="true"
    />
  );
}
