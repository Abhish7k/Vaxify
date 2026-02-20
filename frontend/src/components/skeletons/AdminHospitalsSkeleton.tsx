import { Skeleton } from "@/components/ui/skeleton";

export function AdminHospitalCardSkeleton() {
  return (
    <div className="w-full rounded-xl border bg-background p-6 space-y-5 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-4 w-full">
          {/* hospital skeleton */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            <div className="space-y-2 w-full max-w-[200px]">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3.5 w-[80%]" />
            </div>
          </div>

          {/* staff skeleton */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            <div className="space-y-2 w-full max-w-[150px]">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-[70%]" />
            </div>
          </div>
        </div>

        {/* status badge skeleton */}
        <Skeleton className="h-6 w-20 rounded-full shrink-0" />
      </div>

      <div className="border-t" />

      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function AdminHospitalsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <AdminHospitalCardSkeleton key={i} />
      ))}
    </div>
  );
}
