export function DragonMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="dmg" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="var(--gold)" />
          <stop offset="0.5" stopColor="var(--ember)" />
          <stop offset="1" stopColor="var(--fire)" />
        </linearGradient>
      </defs>
      <path d="M24 4 L8 16 L12 34 L24 44 L36 34 L40 16 Z" fill="url(#dmg)" opacity="0.15" />
      <path d="M24 4 L8 16 L12 34 L24 44 L36 34 L40 16 Z" stroke="url(#dmg)" strokeWidth="1.4" fill="none" />
      <circle cx="24" cy="24" r="3" fill="var(--fire)" />
      <path d="M24 10 L24 16 M24 32 L24 38 M14 24 L20 24 M28 24 L34 24" stroke="var(--gold)" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
