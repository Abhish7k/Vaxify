import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { fadeUpItemSlow } from "@/lib/motion";

export function UserDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* top cards grid skeleton */}
      <motion.div
        variants={fadeUpItemSlow}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-[140px] w-full rounded-xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </motion.div>
      {/* bottom section skeleton */}
      <motion.div
        variants={fadeUpItemSlow}
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {/* recent appointments skeleton */}
        <div className="lg:col-span-2">
          <Skeleton className="h-[300px] w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* quick actions skeleton */}
        <div>
          <Skeleton className="h-[300px] w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </motion.div>
    </div>
  );
}
