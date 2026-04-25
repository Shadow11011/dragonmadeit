import Image from "next/image";

/**
 * Compact brand mark used in the navbar and footer next to the wordmark.
 * Renders the monochrome dragon emblem.
 */
export function DragonMark({ size = 28 }: { size?: number }) {
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
      aria-hidden
    />
  );
}
