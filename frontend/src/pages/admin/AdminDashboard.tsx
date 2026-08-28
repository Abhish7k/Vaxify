import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import AdminDashboardSecondSection from "@/components/dashboards/admin/second-section/AdminDashboardSecondSection";
import AdminDashboardStatsGrid from "@/components/dashboards/admin/AdminDashboardStatsGrid";
import { AdminDashboardSkeleton } from "@/components/skeletons/AdminDashboardSkeleton";
import { Button } from "@/components/ui/button";
import { useAdminActivities, useAdminStats } from "@/hooks/queries/use-admin";
import { usePendingHospitals } from "@/hooks/queries/use-hospitals";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { fadeUpItemSpring, staggerContainer } from "@/lib/motion";
import { PageLoadError } from "@/components/ui/page-load-error";

const AdminDashboard = () => {
  const statsQuery = useAdminStats();
  const pendingQuery = usePendingHospitals();
  const activitiesQuery = useAdminActivities();
  const [refreshing, setRefreshing] = useState(false);

  const loading = statsQuery.isPending || pendingQuery.isPending || activitiesQuery.isPending;
  const loadError = statsQuery.isError || pendingQuery.isError || activitiesQuery.isError;

  useQueryErrorToast(
    statsQuery.isError || pendingQuery.isError || activitiesQuery.isError,
    "Failed to load dashboard data",
    statsQuery.error ?? pendingQuery.error ?? activitiesQuery.error,
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        statsQuery.refetch(),
        pendingQuery.refetch(),
        activitiesQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (loadError) {
    return (
      <PageLoadError
        message="Could not load dashboard data. Please try again."
        onRetry={() => void handleRefresh()}
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* header */}
      <motion.div
        variants={fadeUpItemSpring}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-level overview and system management
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </motion.div>

      {/* stats */}
      <motion.div variants={fadeUpItemSpring}>
        <AdminDashboardStatsGrid stats={statsQuery.data ?? null} />
      </motion.div>

      {/* middle section */}
      <motion.div variants={fadeUpItemSpring}>
        <AdminDashboardSecondSection
          pendingHospitals={pendingQuery.data ?? []}
          activities={activitiesQuery.data ?? []}
        />
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
