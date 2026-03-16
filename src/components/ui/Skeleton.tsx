import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text" | "card";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "rect", width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse",
        {
          "rounded-lg bg-bg-tertiary": variant === "rect",
          "rounded-full bg-bg-tertiary": variant === "circle",
          "rounded h-4 bg-bg-tertiary": variant === "text",
          "rounded-xl bg-[#12121a] border border-[#27272a]": variant === "card",
        },
        className
      )}
      style={{
        ...(width != null ? { width: typeof width === "number" ? `${width}px` : width } : {}),
        ...(height != null ? { height: typeof height === "number" ? `${height}px` : height } : {}),
      }}
    />
  );
}
