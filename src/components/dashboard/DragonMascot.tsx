"use client";

interface DragonMascotProps {
  size?: number;
  tierColor?: string;
}

export function DragonMascot({ size = 32, tierColor = "#ff4500" }: DragonMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="dragon-mascot"
      aria-label="Dragon mascot"
    >
      <style>{`
        .dragon-mascot {
          animation: dragon-breathe 3s ease-in-out infinite;
        }
        @keyframes dragon-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .dragon-eye {
          animation: dragon-blink 4s ease-in-out infinite;
        }
        @keyframes dragon-blink {
          0%, 42%, 44%, 100% { transform: scaleY(1); }
          43% { transform: scaleY(0.1); }
        }
      `}</style>

      {/* Head shape */}
      <path
        d="M32 6C18 6 10 16 10 28C10 36 14 42 20 46L18 56L26 50C28 51 30 51.5 32 51.5C34 51.5 36 51 38 50L46 56L44 46C50 42 54 36 54 28C54 16 46 6 32 6Z"
        fill="#1a1a2e"
        stroke={tierColor}
        strokeWidth="1.5"
      />

      {/* Left horn */}
      <path
        d="M18 18L12 4L22 14"
        fill={tierColor}
        opacity="0.8"
      />

      {/* Right horn */}
      <path
        d="M46 18L52 4L42 14"
        fill={tierColor}
        opacity="0.8"
      />

      {/* Left eye */}
      <g className="dragon-eye" style={{ transformOrigin: "24px 26px" }}>
        <ellipse cx="24" cy="26" rx="4" ry="5" fill={tierColor} opacity="0.3" />
        <ellipse cx="24" cy="26" rx="2.5" ry="3.5" fill={tierColor} />
        <ellipse cx="24.5" cy="25" rx="1" ry="1.5" fill="#fff" opacity="0.8" />
      </g>

      {/* Right eye */}
      <g className="dragon-eye" style={{ transformOrigin: "40px 26px" }}>
        <ellipse cx="40" cy="26" rx="4" ry="5" fill={tierColor} opacity="0.3" />
        <ellipse cx="40" cy="26" rx="2.5" ry="3.5" fill={tierColor} />
        <ellipse cx="40.5" cy="25" rx="1" ry="1.5" fill="#fff" opacity="0.8" />
      </g>

      {/* Snout / nose ridge */}
      <path
        d="M28 34L32 30L36 34"
        stroke={tierColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nostrils */}
      <circle cx="29" cy="36" r="1.5" fill={tierColor} opacity="0.5" />
      <circle cx="35" cy="36" r="1.5" fill={tierColor} opacity="0.5" />

      {/* Mouth line */}
      <path
        d="M26 40Q32 44 38 40"
        stroke={tierColor}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Scales on forehead */}
      <path
        d="M28 16L32 12L36 16"
        stroke={tierColor}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}
