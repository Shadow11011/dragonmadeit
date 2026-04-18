export function Sigil({ size = "md", style }: { size?: "sm" | "md"; style?: React.CSSProperties }) {
  return <div className={"sigil" + (size === "sm" ? " sigil-sm" : "")} aria-hidden="true" style={style} />;
}
