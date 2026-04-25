export const NICHES = [
  "Reddit Stories",
  "True Crime",
  "Horror",
  "Motivation",
  "Dating Drama",
  "Mythology",
  "History",
  "Gaming Lore",
  "Sports Takes",
  "Business Tips",
  "Psychology",
  "Conspiracy",
];

export function NicheMarquee() {
  const row = [...NICHES, ...NICHES];
  return (
    <section
      style={{
        padding: "40px 0",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="marquee">
        <div className="marquee-track">
          {row.map((n, i) => (
            <span
              key={i}
              className="mono"
              style={{
                fontSize: 13,
                letterSpacing: "0.2em",
                color: "var(--text-2)",
                whiteSpace: "nowrap",
              }}
            >
              {n.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
