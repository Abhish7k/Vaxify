import { motion, type Variants } from "framer-motion";
import AdminPlatformMetricsChart from "@/components/dashboards/admin/charts-section/AdminPlatformMetricsChart";
import AdminAppointmentStatusPie from "@/components/dashboards/admin/charts-section/AdminDashboardAppointmentsStatus";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const AdminAnalyticsPage = () => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed platform metrics and performance tracking
        </p>
      </motion.div>

      {/* Main Charts */}
      <div className="grid grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="col-span-12 xl:col-span-8">
          <AdminPlatformMetricsChart />
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 xl:col-span-4">
          <div className="h-full">
            <AdminAppointmentStatusPie />
          </div>
        </motion.div>
      </div>

      {/* You could add more analytics specific cards here later */}
    </motion.div>
  );
};

export default AdminAnalyticsPage;
