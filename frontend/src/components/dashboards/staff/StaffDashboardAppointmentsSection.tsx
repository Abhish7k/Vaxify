import StaffDashboardUpcomingAppointmentsComponent from "./StaffDashboardUpcomingAppointmentsComponent";
import { StaffDashboardRecentVaccinationsCardComponent } from "./StaffDashboardRecentVaccinationsCardComponent";
import type { Appointment } from "@/types/appointment";

interface StaffAppointmentsSectionProps {
  appointments: Appointment[];
  loading: boolean;
  onRefresh: () => void;
}

export default function StaffAppointmentsSection({
  appointments,
  loading,
  onRefresh,
}: StaffAppointmentsSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StaffDashboardUpcomingAppointmentsComponent
        appointments={appointments}
        loading={loading}
        onRefresh={onRefresh}
      />

      <StaffDashboardRecentVaccinationsCardComponent
        appointments={appointments}
        loading={loading}
      />
    </div>
  );
}
