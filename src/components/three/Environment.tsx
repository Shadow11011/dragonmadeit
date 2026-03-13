"use client";

import { Stars } from "@react-three/drei";

export function Environment() {
  return (
    <>
      {/* Very dim ambient for base visibility */}
      <ambientLight color="#111111" intensity={0.3} />

      {/* Main fire-colored point light above and in front */}
      <pointLight
        color="#ff4500"
        intensity={2}
        distance={15}
        position={[2, 4, 4]}
      />

      {/* Spotlight from above-right aimed at dragon */}
      <spotLight
        color="#ff8c00"
        intensity={1.5}
        position={[5, 6, 2]}
        angle={0.5}
        penumbra={0.5}
        target-position={[0, 0, 0]}
      />

      {/* Dim under-glow */}
      <pointLight
        color="#1a0505"
        intensity={0.8}
        distance={10}
        position={[0, -3, 0]}
      />

      {/* Starfield for depth */}
      <Stars
        radius={50}
        depth={50}
        count={200}
        factor={2}
        saturation={0}
        fade
        speed={0.5}
      />
    </>
  );
}
