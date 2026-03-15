"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ScrollAnimationProps {
  /** Directory under /frames/ containing the WEBP sequence */
  frameDir: string;
  /** Total number of frames */
  frameCount: number;
  /** File prefix, e.g. "frame_" for frame_0001.webp */
  framePrefix?: string;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
}

/**
 * Scroll-driven flipbook animation.
 * Preloads WEBP frames, draws them to a canvas based on scroll progress.
 * Parent must provide a scroll-driving container (sticky positioning + tall wrapper).
 */
export function ScrollAnimation({
  frameDir,
  frameCount,
  framePrefix = "frame_",
  width = 1920,
  height = 1080,
}: ScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Preload all frames
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const padded = String(i).padStart(4, "0");
      img.src = `/frames/${frameDir}/${framePrefix}${padded}.webp`;

      img.onload = () => {
        loaded++;
        setLoadProgress(loaded / frameCount);
        if (loaded === frameCount) {
          imagesRef.current = images;
          setIsReady(true);
          // Draw first frame immediately
          drawFrame(0, images);
        }
      };

      img.onerror = () => {
        loaded++;
        setLoadProgress(loaded / frameCount);
        if (loaded === frameCount) {
          imagesRef.current = images;
          setIsReady(true);
        }
      };

      images.push(img);
    }
  }, [frameDir, frameCount, framePrefix]);

  const drawFrame = useCallback(
    (index: number, imgs?: HTMLImageElement[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const images = imgs ?? imagesRef.current;
      const clampedIndex = Math.max(0, Math.min(index, images.length - 1));
      const img = images[clampedIndex];

      if (img?.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentFrameRef.current = clampedIndex;
      }
    },
    []
  );

  /**
   * Called by parent with a progress value 0-1.
   * Maps progress to frame index and draws.
   */
  const setProgress = useCallback(
    (progress: number) => {
      if (!isReady) return;
      const frameIndex = Math.round(progress * (frameCount - 1));
      if (frameIndex !== currentFrameRef.current) {
        drawFrame(frameIndex);
      }
    },
    [isReady, frameCount, drawFrame]
  );

  // Expose setProgress via ref callback pattern
  const progressRef = useRef(setProgress);
  progressRef.current = setProgress;

  // Attach to window for parent to call — use a data attribute approach instead
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Store the callback on the canvas element for the parent to access
    (canvas as unknown as Record<string, unknown>).__setProgress =
      (p: number) => progressRef.current(p);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <div className="w-48 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full fire-gradient rounded-full transition-all duration-300"
              style={{ width: `${loadProgress * 100}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">
            Loading animation...
          </p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full max-h-full object-contain"
        style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.5s" }}
      />
    </div>
  );
}
