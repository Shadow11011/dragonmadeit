import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <Skeleton variant="text" className="h-9 w-36" />

      {/* Profile section skeleton */}
      <div className="rounded-xl bg-bg-secondary border border-border p-6 space-y-4">
        <Skeleton variant="text" className="h-6 w-20" />
        <div className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <Skeleton variant="text" className="h-4 w-12" />
            <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton variant="text" className="h-4 w-12" />
            <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton variant="rect" className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Subscription section skeleton */}
      <div className="rounded-xl bg-bg-secondary border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="text" className="h-6 w-32" />
          <Skeleton variant="text" className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton variant="text" className="h-4 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg-primary p-5 space-y-3"
            >
              <Skeleton variant="text" className="h-5 w-24" />
              <Skeleton variant="text" className="h-7 w-16" />
              <div className="space-y-2 pt-2">
                {Array.from({ length: 4 }, (_, j) => (
                  <Skeleton key={j} variant="text" className="h-4 w-full" />
                ))}
              </div>
              <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
