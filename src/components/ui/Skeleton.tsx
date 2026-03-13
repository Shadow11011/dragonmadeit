import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export function Skeleton({ className, variant = "rect" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-bg-tertiary",
        {
          "rounded-lg": variant === "rect",
          "rounded-full": variant === "circle",
          "rounded h-4": variant === "text",
        },
        className
      )}
    />
  );
}
