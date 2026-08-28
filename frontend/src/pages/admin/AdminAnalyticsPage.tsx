import { motion } from "framer-motion";
import AdminDashboardStatsGrid from "@/components/dashboards/admin/AdminDashboardStatsGrid";
import { AdminDashboardSkeleton } from "@/components/skeletons/AdminDashboardSkeleton";
import { PageLoadError } from "@/components/ui/page-load-error";
import { useAdminStats } from "@/hooks/queries/use-admin";

import { fadeUpItemSpring, staggerContainer } from "@/lib/motion";

const AdminAnalyticsPage = () => {
  const statsQuery = useAdminStats();
  const stats = statsQuery.data ?? null;
  const loading = statsQuery.isPending;
  const loadError = statsQuery.isError || (!loading && !stats);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (loadError || !stats) {
    return (
      <PageLoadError
        message="Could not load platform analytics. Please try again."
        onRetry={() => void statsQuery.refetch()}
      />
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={fadeUpItemSpring}>
        <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live platform totals from the current database
        </p>
      </motion.div>

      <motion.div variants={fadeUpItemSpring}>
        <AdminDashboardStatsGrid stats={stats} />
      </motion.div>
    </motion.div>
  );
};

export default AdminAnalyticsPage;
