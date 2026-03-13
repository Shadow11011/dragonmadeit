import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountsLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-9 w-56" />
        <Skeleton variant="text" className="h-5 w-20 rounded-full" />
      </div>

      {/* Tier info skeleton */}
      <div className="rounded-xl bg-bg-secondary border border-border p-4">
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* Usage bar skeleton */}
      <div className="rounded-xl bg-bg-secondary border border-border p-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-12" />
        </div>
        <Skeleton variant="rect" className="h-2 w-full rounded-full" />
      </div>

      {/* Account cards skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-bg-secondary border border-border p-4"
          >
            <Skeleton variant="circle" className="h-10 w-10" />
            <div className="space-y-1.5 flex-1">
              <Skeleton variant="text" className="h-4 w-32" />
              <Skeleton variant="text" className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
    </div>
  );
}
