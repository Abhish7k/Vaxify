import { motion, type Variants } from "framer-motion";
import StaffStatsGrid from "@/components/dashboards/staff/StaffDashboardStatsGrid";
import StaffAppointmentsSection from "@/components/dashboards/staff/StaffDashboardAppointmentsSection";
import StaffDashboardChartsSection from "@/components/dashboards/staff/StaffDashboardChartsSection";
import { useEffect, useState } from "react";
import { hospitalApi } from "@/api/hospital.api";
import { appointmentApi } from "@/api/appointment.api";
import { vaccineApi } from "@/api/vaccine.api";
import type { Appointment } from "@/types/appointment";
import type { Vaccine } from "@/types/vaccine";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const hospital = await hospitalApi.getMyHospital();

      if (!hospital) {
        return;
      }

      const [appointmentsData, vaccinesData] = await Promise.all([
        appointmentApi.getStaffAppointments(String(hospital.id)),
        vaccineApi.getMyVaccines(),
      ]);

      setAppointments(appointmentsData);

      setVaccines(vaccinesData);
    } catch (error) {
      console.error("error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <motion.div
      className="space-y-6 overflow-hidden mb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold mb-2">Hospital Staff Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of vaccination activity and appointments</p>
      </motion.div>

      {/* stats grid */}
      <motion.div variants={itemVariants}>
        <StaffStatsGrid appointments={appointments} vaccines={vaccines} loading={loading} />
      </motion.div>

      {/* appointments */}
      <motion.div variants={itemVariants}>
        <StaffAppointmentsSection appointments={appointments} loading={loading} onRefresh={fetchData} />
      </motion.div>

      {/* charts */}
      <motion.div variants={itemVariants}>
        <StaffDashboardChartsSection appointments={appointments} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
