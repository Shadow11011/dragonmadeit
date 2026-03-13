import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <Skeleton variant="text" className="h-9 w-40" />

      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl bg-bg-secondary border border-border p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton variant="circle" className="h-5 w-5" />
              <Skeleton variant="text" className="h-4 w-24" />
            </div>
            <Skeleton variant="text" className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Bar chart skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-40" />
        <div className="rounded-xl bg-bg-secondary border border-border p-6">
          <div className="flex items-end justify-between gap-3 h-48">
            {[30, 40, 50, 60, 70, 30, 50].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center" style={{ height: `${h}%` }}>
                  <Skeleton
                    variant="rect"
                    className="w-full max-w-[40px] h-full rounded-t-md"
                  />
                </div>
                <Skeleton variant="text" className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement chart skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-44" />
        <div className="rounded-xl bg-bg-secondary border border-border p-6 space-y-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-8" />
              <Skeleton variant="rect" className="h-3 flex-1 rounded-full" />
              <Skeleton variant="text" className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
