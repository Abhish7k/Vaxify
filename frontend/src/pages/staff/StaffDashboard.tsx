import { motion } from "framer-motion";
import StaffStatsGrid from "@/components/dashboards/staff/StaffDashboardStatsGrid";
import StaffAppointmentsSection from "@/components/dashboards/staff/StaffDashboardAppointmentsSection";
import StaffDashboardChartsSection from "@/components/dashboards/staff/StaffDashboardChartsSection";
import { PageLoadError } from "@/components/ui/page-load-error";
import { useMyHospital } from "@/hooks/queries/use-hospitals";
import { useMyVaccines } from "@/hooks/queries/use-vaccines";
import { useStaffAppointments } from "@/hooks/queries/use-appointments";
import { fadeUpItem, staggerContainer } from "@/lib/motion";

export default function StaffDashboard() {
  const hospitalQuery = useMyHospital();
  const hospitalId = hospitalQuery.data?.id ? String(hospitalQuery.data.id) : undefined;

  const appointmentsQuery = useStaffAppointments(hospitalId);
  const vaccinesQuery = useMyVaccines();

  const loading =
    hospitalQuery.isLoading || appointmentsQuery.isLoading || vaccinesQuery.isLoading;
  const loadError =
    hospitalQuery.isError ||
    appointmentsQuery.isError ||
    vaccinesQuery.isError ||
    (!hospitalQuery.isPending && !hospitalQuery.data);

  const appointments = appointmentsQuery.data ?? [];
  const vaccines = vaccinesQuery.data ?? [];
  const canMutate = hospitalQuery.data?.status === "APPROVED";

  const refetchAll = () => {
    void hospitalQuery.refetch();
    void appointmentsQuery.refetch();
    void vaccinesQuery.refetch();
  };

  return (
    <motion.div
      className="space-y-6 overflow-hidden mb-20"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* header */}
      <motion.div variants={fadeUpItem}>
        <h1 className="text-2xl font-semibold mb-2">Hospital Staff Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of vaccination activity and appointments</p>
      </motion.div>

      {loadError && !loading ? (
        <PageLoadError
          message="Could not load dashboard data. Please try again."
          onRetry={refetchAll}
        />
      ) : (
        <>
          <motion.div variants={fadeUpItem}>
            <StaffStatsGrid appointments={appointments} vaccines={vaccines} loading={loading} />
          </motion.div>

          <motion.div variants={fadeUpItem}>
            <StaffAppointmentsSection
              appointments={appointments}
              loading={loading}
              onRefresh={refetchAll}
              canMutate={canMutate}
            />
          </motion.div>

          <motion.div variants={fadeUpItem}>
            <StaffDashboardChartsSection appointments={appointments} loading={loading} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
