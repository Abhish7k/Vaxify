import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserDashboardSkeleton } from "@/components/skeletons/UserDashboardSkeleton";
import { userApi, type UserStats } from "@/api/user.api";

import UserDashboardHeader from "@/components/dashboards/user/UserDashboardHeader";
import UserDashboardStatsGrid from "@/components/dashboards/user/UserDashboardStatsGrid";
import UserDashboardRecentAppointments from "@/components/dashboards/user/UserDashboardRecentAppointments";
import UserDashboardQuickActions from "@/components/dashboards/user/UserDashboardQuickActions";
import UserDashboardTicketDialog from "@/components/dashboards/user/UserDashboardTicketDialog";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

export default function UserDashboard() {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userApi.getStats();

        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  console.log(stats);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 px-3 sm:px-4 lg:px-6"
    >
      <UserDashboardHeader />

      <motion.div variants={item} className="w-full">
        {loading ? (
          <UserDashboardSkeleton />
        ) : stats ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed">
            <p className="text-muted-foreground mb-4">Could not load dashboard data.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
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
