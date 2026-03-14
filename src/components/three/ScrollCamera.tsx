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

const TOTAL_SECTIONS = CAMERA_POSITIONS.length - 1;
const LOOK_AT = new THREE.Vector3(0, 0, 0);
const LERP_FACTOR = 0.05;

export function ScrollCamera() {
  const scroll = useScroll();
  const targetPosition = useRef(new THREE.Vector3());
  const lastOffset = useRef(-1);

  useFrame(({ camera }) => {
    const offset = scroll.offset;

    // Only recalculate target when scroll offset actually changes
    if (Math.abs(offset - lastOffset.current) > 0.0001) {
      lastOffset.current = offset;

      const rawIndex = offset * TOTAL_SECTIONS;
      const sectionIndex = Math.min(Math.floor(rawIndex), TOTAL_SECTIONS - 1);
      const sectionProgress = rawIndex - sectionIndex;

      targetPosition.current.lerpVectors(
        CAMERA_POSITIONS[sectionIndex],
        CAMERA_POSITIONS[sectionIndex + 1],
        sectionProgress
      );
    }

    // Smooth camera movement — always lerp toward target
    camera.position.lerp(targetPosition.current, LERP_FACTOR);
    camera.lookAt(LOOK_AT);
  });

  return null;
}
