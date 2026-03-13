"use client";

import { Sparkles } from "@react-three/drei";

interface FireParticlesProps {
  count?: number;
  intensity?: "low" | "medium" | "high";
}

const INTENSITY_COUNT: Record<string, number> = {
  low: 50,
  medium: 150,
  high: 300,
};

export function FireParticles({
  count,
  intensity = "medium",
}: FireParticlesProps) {
  const particleCount = count ?? INTENSITY_COUNT[intensity];

  return (
    <group position={[0, -1, 0]}>
      <Sparkles
        count={particleCount}
        scale={[6, 6, 6]}
        size={3}
        speed={0.3}
        color="#ff4500"
      />
      <Sparkles
        count={Math.floor(particleCount * 0.5)}
        scale={[5, 5, 5]}
        size={2}
        speed={0.3}
        color="#ff8c00"
      />
    </group>
  );
}
