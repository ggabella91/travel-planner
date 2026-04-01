import { Skeleton } from "@/components/ui/skeleton";

export default function TripDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="h-48 w-full bg-muted animate-pulse" />

      <div className="mx-auto max-w-lg px-5 pt-4">
        {/* Metadata */}
        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Places section */}
        <div className="pt-4">
          <Skeleton className="h-4 w-16 mb-3" />
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
