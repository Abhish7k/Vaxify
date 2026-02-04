import { StaffAppointmentStatusPie } from "./charts/StaffAppointmentStatusPie";
import { StaffAppointmentsTrendLine } from "./charts/StaffAppointmentsTrendLine";
import type { Appointment } from "@/types/appointment";

interface StaffDashboardChartsSectionProps {
  appointments: Appointment[];
  loading: boolean;
}

export default function StaffDashboardChartsSection({
  appointments,
  loading,
}: StaffDashboardChartsSectionProps) {
  return (
    <div className="grid gap-4 grid-cols-12">
      <StaffAppointmentsTrendLine
        appointments={appointments}
        loading={loading}
      />

      <StaffAppointmentStatusPie
        appointments={appointments}
        loading={loading}
      />
    </div>
  );
}
