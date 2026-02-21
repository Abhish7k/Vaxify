import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { UserStats } from "@/api/user.api";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  loading?: boolean;
}

function StatCard({ title, value, subtitle, icon, loading }: StatCardProps) {
  const imageAnimation = {
    hover: {
      scale: 1.1,
      rotate: 5,
      x: 5,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  } as any;

  return (
    <motion.div whileHover="hover" className="h-full">
      <Card className="p-6 h-full relative overflow-hidden group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-xl font-semibold tracking-tight">{value}</p>
            )}
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="w-12 h-12 shrink-0" />
        </div>

        {/* animated backdrop icon */}
        <motion.div
          variants={imageAnimation}
          className="absolute -right-8 -bottom-8 w-32 h-32 opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full flex items-center justify-center p-4"
        >
          <img src={icon} alt="" className="w-full h-full object-contain" draggable={false} />
        </motion.div>
      </Card>
    </motion.div>
  );
}

interface UserDashboardStatsGridProps {
  stats: UserStats;
  loading: boolean;
}

export default function UserDashboardStatsGrid({ stats, loading }: UserDashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Upcoming Appointment"
        value={
          stats.upcomingAppointmentDate === "No upcoming"
            ? "None"
            : new Date(stats.upcomingAppointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }
        subtitle={stats.upcomingAppointmentDate === "No upcoming" ? "Schedule one today" : "Your next visit"}
        icon="https://ik.imagekit.io/vaxify/icons/upcoming.png"
        loading={loading}
      />

      <StatCard
        title="Vaccination Status"
        value={stats.vaccinationStatus}
        subtitle="Current health level"
        icon="https://ik.imagekit.io/vaxify/icons/sheild.png"
        loading={loading}
      />

      <StatCard
        title="Total Appointments"
        value={stats.totalAppointments}
        subtitle="All time bookings"
        icon="https://ik.imagekit.io/vaxify/icons/calendar.png"
        loading={loading}
      />

      <StatCard
        title="Doses Completed"
        value={stats.completedAppointments}
        subtitle="Fully protected doses"
        icon="https://ik.imagekit.io/vaxify/icons/booster.png"
        loading={loading}
      />
    </div>
  );
}
