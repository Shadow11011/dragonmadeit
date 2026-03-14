"use client";

import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ScrollCamera } from "@/components/three/ScrollCamera";
import { Environment } from "@/components/three/Environment";
import { ProceduralDragon } from "@/components/three/ProceduralDragon";
import { FireParticles } from "@/components/three/FireParticles";

interface DragonSceneProps {
  complexity?: "low" | "medium" | "high";
}

function SceneContent({
  complexity,
  degraded,
}: {
  complexity: "low" | "medium" | "high";
  degraded: boolean;
}) {
  const effectiveComplexity = degraded
    ? complexity === "high"
      ? "medium"
      : "low"
    : complexity;
  const effectiveIntensity = degraded
    ? "low"
    : complexity;

  return (
    <>
      <ScrollCamera />
      <Environment />
      <ProceduralDragon complexity={effectiveComplexity} />
      <FireParticles intensity={effectiveIntensity} />
    </>
  );
}

export function DragonScene({ complexity = "high" }: DragonSceneProps) {
  // Start with postprocessing OFF; enable only after PerformanceMonitor
  // confirms stable FPS above threshold (incline callback).
  const [degraded, setDegraded] = useState(true);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, degraded ? 1 : 2]}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={4} damping={0.3}>
            <SceneContent complexity={complexity} degraded={degraded} />
            <PerformanceMonitor
              threshold={0.75}
              onIncline={() => setDegraded(false)}
              onDecline={() => setDegraded(true)}
            />
          </ScrollControls>
          {!degraded && (
            <EffectComposer>
              <Bloom
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                intensity={1.5}
              />
              <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
