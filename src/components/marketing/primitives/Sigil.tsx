import Image from "next/image";

/**
 * Brand emblem. Renders the monochrome dragon mark inside a neutral ring.
 * Was previously a radial fire-gradient circle; rebranded to the static mark.
 */
export function Sigil({
  size = "md",
  style,
}: {
  size?: "sm" | "md";
  style?: React.CSSProperties;
}) {
  const inner = size === "sm" ? 18 : 32;
  return (
    <div
      className={"sigil" + (size === "sm" ? " sigil-sm" : "")}
      aria-hidden="true"
      style={style}
    >
      <Image
        src="/images/brand/dragonmark-light-64.png"
        alt=""
        width={inner}
        height={inner}
        style={{ width: inner, height: inner, objectFit: "contain" }}
      />
    </div>
  );
}
