import { Skeleton } from "@/components/ui/Skeleton";

export default function ScheduleLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <Skeleton variant="text" className="h-9 w-40" />

      {/* Calendar section */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-36" />
        <div className="rounded-xl bg-bg-secondary border border-border p-4">
          <div className="grid grid-cols-7 gap-2 min-w-[640px]">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="rounded-lg p-2 min-h-[140px] bg-bg-primary/40">
                <div className="text-center mb-2 space-y-1">
                  <Skeleton variant="text" className="h-3 w-8 mx-auto" />
                  <Skeleton variant="text" className="h-4 w-10 mx-auto" />
                </div>
                <div className="space-y-1.5">
                  {i % 2 === 0 && <Skeleton variant="rect" className="h-5 w-full rounded-md" />}
                  {i % 3 === 0 && <Skeleton variant="rect" className="h-5 w-full rounded-md" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content table section */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-44" />
        <div className="rounded-xl bg-bg-secondary border border-border overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0"
            >
              <Skeleton variant="text" className="h-4 flex-1" />
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-5 w-20 rounded-full" />
              <Skeleton variant="text" className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
