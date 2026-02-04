import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { AdminStats } from "@/api/admin.api";

export default function AdminDashboardStatsGrid({
  stats,
}: {
  stats: AdminStats | null;
}) {
  const statsConfig = [
    {
      title: "Total Hospitals",
      value: stats?.totalHospitals ?? 0,
      subtitle: "Registered on platform",
      icon: "/icons/hospital-1.png",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals ?? 0,
      subtitle: "Awaiting verification",
      icon: "/icons/hourglass.png",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      subtitle: "Citizens registered",
      icon: "/icons/users.png",
    },
    {
      title: "Active Centers",
      value: stats?.activeCenters ?? 0,
      subtitle: "Operational vaccination centers",
      icon: "/icons/center.png",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
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
            <p className="text-2xl font-semibold tracking-tight">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="w-12 h-12 shrink-0" />
        </div>

        <motion.div
          variants={imageAnimation}
          className="absolute -right-8 -bottom-8 w-32 h-32 opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full flex items-center justify-center p-4"
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
