import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <Skeleton variant="text" className="h-9 w-48" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl bg-bg-secondary border border-border p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton variant="circle" className="h-5 w-5" />
              <Skeleton variant="text" className="h-4 w-20" />
            </div>
            <Skeleton variant="text" className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-40" />
        <div className="rounded-xl bg-bg-secondary border border-border overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <Skeleton variant="text" className="h-4 w-full max-w-[500px]" />
          </div>
          {Array.from({ length: 5 }, (_, i) => (
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
