"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Wraps children with LazyMotion using domAnimation features.
 * This loads only the subset of framer-motion features needed for DOM animations
 * (~17kB instead of ~95kB for the full motion bundle).
 *
 * Components within this provider should use `m` instead of `motion` for elements,
 * or continue using `motion` (which auto-loads features but benefits from
 * LazyMotion's deduplication).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict={false}>
      {children}
    </LazyMotion>
  );
}
