import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Appointment } from "@/types/appointment";
import type { Vaccine } from "@/types/vaccine";
import { motion, type Variants } from "framer-motion";

interface StaffStatsGridProps {
  appointments: Appointment[];
  vaccines: Vaccine[];
  loading: boolean;
}

export default function StaffStatsGrid({
  appointments,
  vaccines,
  loading,
}: StaffStatsGridProps) {
  const totalAppointments = appointments.length;

  const upcoming = appointments.filter((a) =>
    ["BOOKED", "UPCOMING", "scheduled"].includes(a.status),
  ).length;

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr,
  ).length;

  const lowStockCount = vaccines.filter(
    (v) => v.stock / v.capacity < 0.2,
  ).length;

  const stats = [
    {
      title: "Total Appointments",
      value: totalAppointments,
      subtitle: "All processed appointments",
      icon: "https://ik.imagekit.io/vaxify/icons/calendar.png",
    },
    {
      title: "Upcoming Appointments",
      value: upcoming,
      subtitle: "Pending action",
      icon: "https://ik.imagekit.io/vaxify/icons/upcoming.png",
    },
    {
      title: "Bookings Today",
      value: todayAppointments,
      subtitle: "Scheduled for today",
      icon: "https://ik.imagekit.io/vaxify/icons/checklist.png",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockCount,
      subtitle: "Critical inventory items",
      icon: "https://ik.imagekit.io/vaxify/icons/low-stock.png",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 duration-500">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} loading={loading} />
      ))}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  loading?: boolean;
}

function StatCard({ title, value, subtitle, icon, loading }: StatCardProps) {
  const imageAnimation: Variants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      x: 5,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  return (
    <motion.div whileHover="hover" className="h-full">
      <Card className="p-6 relative overflow-hidden group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between relative z-10">
          {/* left */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-semibold">{value}</p>
            )}

            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          {/* right icon space */}
          <div className="w-12 h-12 shrink-0" />
        </div>

        {/* animated image backdrop */}
        <motion.div
          variants={imageAnimation}
          className={cn(
            "absolute -right-8 -bottom-8 w-32 h-32 opacity-85 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full flex items-center justify-center p-4",
          )}
        >
          <img
            src={icon}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        </motion.div>
      </Card>
    </motion.div>
  );
}
