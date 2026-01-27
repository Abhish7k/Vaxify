import EmptyStaffAppointmentsState from "./EmptyStaffAppointmentsState";
import StaffAppointmentCard from "./StaffAppointmentCard";
import type { StaffAppointmentStatus } from "./StaffAppointmentsTabsSection";

export default function StaffAppointmentsListSection({
  appointments,
  activeStatus,
  onMarkCompleted,
  onCancelAppointment,
}: Props) {
  const filteredAppointments = appointments.filter(
    (appointment) => appointment.status === activeStatus,
  );

  if (filteredAppointments.length === 0) {
    return <EmptyStaffAppointmentsState status={activeStatus} />;
  }

  return (
    <div className="mt-10 grid gap-5">
      {filteredAppointments.map((appointment) => (
        <StaffAppointmentCard
          key={appointment.id}
          appointment={appointment}
          onMarkCompleted={() => onMarkCompleted(appointment)}
          onCancel={() => onCancelAppointment(appointment)}
        />
      ))}
    </div>
  );
}

export type StaffAppointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  vaccine: string;
  date: string;
  timeSlot: string;
  status: StaffAppointmentStatus;
};

type Props = {
  appointments: StaffAppointment[];
  activeStatus: StaffAppointmentStatus;
  onMarkCompleted: (appointment: StaffAppointment) => void;
  onCancelAppointment: (appointment: StaffAppointment) => void;
};
