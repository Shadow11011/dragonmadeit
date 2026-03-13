"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Line } from "@react-three/drei";
import * as THREE from "three";

interface ProceduralDragonProps {
  complexity?: "low" | "medium" | "high";
}

function DragonWing({
  side,
  complexity,
}: {
  side: "left" | "right";
  complexity: "medium" | "high";
}) {
  const wingRef = useRef<THREE.Mesh>(null);
  const mirror = side === "left" ? -1 : 1;

  const wingGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(mirror * 0.3, 0.5);
    shape.lineTo(mirror * 1.8, 1.2);
    shape.lineTo(mirror * 2.2, 0.6);
    shape.lineTo(mirror * 1.5, -0.2);
    shape.lineTo(mirror * 0.8, -0.1);
    shape.lineTo(0, 0);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: false,
    });
  }, [mirror]);

  useFrame(({ clock }) => {
    if (wingRef.current) {
      const flapSpeed = complexity === "high" ? 0.5 : 0.3;
      const flapAmount = complexity === "high" ? 0.3 : 0.2;
      wingRef.current.rotation.z =
        mirror * Math.sin(clock.elapsedTime * flapSpeed) * flapAmount;
    }
  });

  return (
    <mesh
      ref={wingRef}
      geometry={wingGeometry}
      position={[mirror * 0.5, 0.3, -0.2]}
    >
      <meshStandardMaterial
        color="#1a0808"
        emissive="#ff4500"
        emissiveIntensity={0.1}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function DragonTail({ complexity }: { complexity: "medium" | "high" }) {
  const tailPointsRef = useRef<THREE.Vector3[]>([]);

  const basePoints = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.8, -0.5),
      new THREE.Vector3(0, -1.2, -1.2),
      new THREE.Vector3(0, -1.0, -2.0),
      new THREE.Vector3(0, -0.6, -2.6),
      new THREE.Vector3(0, -0.3, -3.0),
    ]);
    return curve.getPoints(complexity === "high" ? 30 : 20);
  }, [complexity]);

  useFrame(({ clock }) => {
    tailPointsRef.current = basePoints.map((p, i) => {
      const waveAmount = (i / basePoints.length) * 0.4;
      return new THREE.Vector3(
        p.x + Math.sin(clock.elapsedTime * 1.5 + i * 0.3) * waveAmount,
        p.y,
        p.z
      );
    });
  });

  // Use a static initial set for the Line component
  const initialPoints = useMemo(() => {
    return basePoints.map((p) => p.clone());
  }, [basePoints]);

  return (
    <Line
      points={initialPoints}
      color="#ff4500"
      lineWidth={3}
      vertexColors={basePoints.map((_, i) =>
        new THREE.Color("#1a0505").lerp(
          new THREE.Color("#ff4500"),
          i / basePoints.length
        )
      )}
    />
  );
}

export function ProceduralDragon({
  complexity = "high",
}: ProceduralDragonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const distort = complexity === "high" ? 0.4 : complexity === "medium" ? 0.25 : 0.15;
  const speed = complexity === "high" ? 2 : complexity === "medium" ? 1.5 : 1;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color="#1a0505"
          emissive="#ff4500"
          emissiveIntensity={0.15}
          distort={distort}
          speed={speed}
          roughness={0.6}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0.8]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <MeshDistortMaterial
          color="#1a0505"
          emissive="#ff4500"
          emissiveIntensity={0.2}
          distort={distort * 0.6}
          speed={speed * 0.8}
          roughness={0.6}
        />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.15, 1.3, 1.2]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={3}
        />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.15, 1.3, 1.2]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={3}
        />
      </mesh>

      {/* Wings - only for medium and high */}
      {complexity !== "low" && (
        <>
          <DragonWing side="left" complexity={complexity} />
          <DragonWing side="right" complexity={complexity} />
        </>
      )}

      {/* Tail - only for medium and high */}
      {complexity !== "low" && <DragonTail complexity={complexity} />}
    </group>
  );
}
