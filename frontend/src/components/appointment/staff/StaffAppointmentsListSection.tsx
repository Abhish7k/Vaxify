import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import EmptyStaffAppointmentsState from "./EmptyStaffAppointmentsState";
import type {
  Appointment as StaffAppointment,
} from "@/types/appointment";
import type { StaffAppointmentStatus } from "./StaffAppointmentsTabsSection";
import { matchesStaffAppointmentTab } from "@/types/appointment";
import { getStaffAppointmentColumns } from "./StaffAppointmentColumns";

export default function StaffAppointmentsListSection({
  appointments,
  activeStatus,
  onMarkCompleted,
  onCancelAppointment,
  canMutate = true,
}: Props) {
  const filteredAppointments = appointments.filter((appointment) =>
    matchesStaffAppointmentTab(appointment.status, activeStatus),
  );

  const columns = useMemo(
    () =>
      getStaffAppointmentColumns({
        onMarkCompleted,
        onCancelAppointment,
        canMutate,
      }),
    [onMarkCompleted, onCancelAppointment, canMutate],
  );

  if (filteredAppointments.length === 0) {
    return <EmptyStaffAppointmentsState status={activeStatus} />;
  }

  return (
    <div className="mt-6">
      <DataTable
        columns={columns}
        data={filteredAppointments}
        searchKey="patientName"
        searchPlaceholder="Search patients..."
        initialVisibility={{
          patientPhone: false,
        }}
      />
    </div>
  );
}

type Props = {
  appointments: StaffAppointment[];
  activeStatus: StaffAppointmentStatus;
  onMarkCompleted: (appointment: StaffAppointment) => void;
  onCancelAppointment: (appointment: StaffAppointment) => void;
  canMutate?: boolean;
};
