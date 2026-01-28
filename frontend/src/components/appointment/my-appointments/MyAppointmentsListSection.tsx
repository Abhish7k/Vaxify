import AppointmentCard from "./AppointmentCard";
import EmptyAppointmentsState from "./EmptyAppointmentsState";
import type { AppointmentStatus } from "./MyAppointmentsTabsSection";

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

  if (filteredAppointments.length === 0) {
    return (
      <EmptyAppointmentsState
        status={activeStatus}
        onBrowseCenters={onBrowseCenters}
      />
    );
  }

  return (
    <div className="space-y-4">
      {filteredAppointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onViewCenter={() => onViewCenter(appointment.centerId)}
          onCancel={() => onCancelAppointment(appointment)}
          onViewTicket={() => onViewTicket(appointment.id)}
        />
      ))}
    </div>
  );
}

export type Appointment = {
  id: string;
  centerId: string;
  centerName: string;
  centerAddress: string;
  vaccine: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
};

type Props = {
  appointments: Appointment[];
  activeStatus: AppointmentStatus;
  onBrowseCenters: () => void;
  onViewCenter: (centerId: string) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onViewTicket: (appointmentId: string) => void;
};
