import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { fadeUpItemSlow } from "@/lib/motion";

export function MyAppointmentsSkeleton() {
  return (
    <motion.div variants={fadeUpItemSlow} className="rounded-md border p-4 space-y-4">
      {/* table teader skeleton */}
      <div className="flex justify-between items-center mb-6 px-2">
        <Skeleton className="h-6 w-1/4 bg-slate-100 dark:bg-slate-800" />
        <Skeleton className="h-6 w-1/4 bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* table rows skeleton */}
      <div className="flex justify-between items-center py-4 border-b last:border-0 px-2">
        <div className="space-y-2 w-1/4">
          <Skeleton className="h-5 w-3/4 bg-slate-100 dark:bg-slate-800" />
          <Skeleton className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="flex items-center gap-2 w-1/4">
          <Skeleton className="h-4 w-4 rounded-full bg-slate-100 dark:bg-slate-800" />
          <Skeleton className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="space-y-1 w-1/4">
          <Skeleton className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800" />
          <Skeleton className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
        <Skeleton className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
    </motion.div>
  );
}
