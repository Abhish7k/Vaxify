import StaffDashboardUpcomingAppointments from "./StaffDashboardUpcomingAppointments";
import { StaffDashboardRecentVaccinationsCard } from "./StaffDashboardRecentVaccinationsCard";
import type { Appointment } from "@/types/appointment";

interface StaffDashboardAppointmentsSectionProps {
  appointments: Appointment[];
  loading: boolean;
  onRefresh: () => void;
  canMutate?: boolean;
}

export default function StaffDashboardAppointmentsSection({
  appointments,
  loading,
  onRefresh,
  canMutate = true,
}: StaffDashboardAppointmentsSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StaffDashboardUpcomingAppointments
        appointments={appointments}
        loading={loading}
        onRefresh={onRefresh}
        canMutate={canMutate}
      />

      <StaffDashboardRecentVaccinationsCard
        appointments={appointments}
        loading={loading}
      />
    </div>
  );
}
