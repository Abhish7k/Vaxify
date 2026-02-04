import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import EmptyAppointmentsState from "./EmptyAppointmentsState";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { getMyAppointmentsColumns } from "./MyAppointmentsColumns";

export default function MyAppointmentsListSection({
  appointments,
  activeStatus,
  onBrowseCenters,
  onViewCenter,
  onCancelAppointment,
  onViewTicket,
}: Props) {
  const filteredAppointments = appointments.filter(
    (appointment) => appointment.status === activeStatus,
  );

  const columns = useMemo(
    () =>
      getMyAppointmentsColumns({
        onCancelAppointment,
        onViewTicket,
        onViewCenter,
      }),
    [onCancelAppointment, onViewTicket, onViewCenter],
  );

  if (filteredAppointments.length === 0) {
    return (
      <EmptyAppointmentsState
        status={activeStatus}
        onBrowseCenters={onBrowseCenters}
      />
    );
  }

  return (
    <div className="mt-6">
      <DataTable
        columns={columns}
        data={filteredAppointments}
        searchKey="centerName"
        searchPlaceholder="Search centers..."
      />
    </div>
  );
}

type Props = {
  appointments: Appointment[];
  activeStatus: AppointmentStatus;
  onBrowseCenters: () => void;
  onViewCenter: (centerId: string) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onViewTicket: (appointmentId: string) => void;
};
