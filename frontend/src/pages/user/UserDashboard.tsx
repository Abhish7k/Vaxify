import { motion } from "framer-motion";
import { fadeUpItemSlow, staggerContainer } from "@/lib/motion";
import { useState } from "react";
import { UserDashboardSkeleton } from "@/components/skeletons/UserDashboardSkeleton";

import UserDashboardHeader from "@/components/dashboards/user/UserDashboardHeader";
import UserDashboardStatsGrid from "@/components/dashboards/user/UserDashboardStatsGrid";
import UserDashboardRecentAppointments from "@/components/dashboards/user/UserDashboardRecentAppointments";
import UserDashboardQuickActions from "@/components/dashboards/user/UserDashboardQuickActions";
import UserDashboardTicketDialog from "@/components/dashboards/user/UserDashboardTicketDialog";
import { useUserStats } from "@/hooks/queries/use-users";
import type { Appointment } from "@/types/appointment";
import { PageLoadError } from "@/components/ui/page-load-error";

export default function UserDashboard() {
  const [selectedTicket, setSelectedTicket] = useState<Appointment | null>(null);
  const statsQuery = useUserStats();
  const stats = statsQuery.data ?? null;
  const loading = statsQuery.isPending;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 px-3 sm:px-4 lg:px-6"
    >
      <UserDashboardHeader />

      <motion.div variants={fadeUpItemSlow} className="w-full">
        {loading ? (
          <UserDashboardSkeleton />
        ) : statsQuery.isError || !stats ? (
          <PageLoadError
            message="Could not load dashboard data. Please try again."
            onRetry={() => void statsQuery.refetch()}
          />
        ) : (
          <div className="space-y-6">
            {/* stats Cards */}
            <UserDashboardStatsGrid stats={stats} loading={loading} />

            {/* bottom section */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <UserDashboardRecentAppointments
                appointments={stats.recentAppointments}
                onViewTicket={setSelectedTicket}
              />
              <UserDashboardQuickActions />
            </div>
          </div>
        )}
      </motion.div>

      <UserDashboardTicketDialog
        selectedTicket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </motion.div>
  );
}
