"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

const CAMERA_POSITIONS = [
  new THREE.Vector3(0, 0, 8), // Hero view
  new THREE.Vector3(5, 2, 6), // Features angle
  new THREE.Vector3(0, 3, 5), // Pricing top-down
  new THREE.Vector3(0, 1, 6), // CTA view
];

const LOOK_AT = new THREE.Vector3(0, 0, 0);

export function ScrollCamera() {
  const scroll = useScroll();
  const targetPosition = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const offset = scroll.offset; // 0 to 1

    // Determine which two positions to interpolate between
    const totalSections = CAMERA_POSITIONS.length - 1;
    const rawIndex = offset * totalSections;
    const sectionIndex = Math.min(
      Math.floor(rawIndex),
      totalSections - 1
    );
    const sectionProgress = rawIndex - sectionIndex;

    const from = CAMERA_POSITIONS[sectionIndex];
    const to = CAMERA_POSITIONS[sectionIndex + 1];

    targetPosition.current.lerpVectors(from, to, sectionProgress);

    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.05);
    camera.lookAt(LOOK_AT);
  });

  return null;
}
