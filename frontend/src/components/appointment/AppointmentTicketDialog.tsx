import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TicketCard } from "@/components/appointment/TicketCard";
import { type Appointment } from "@/types/appointment";

interface AppointmentTicketDialogProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export default function AppointmentTicketDialog({ appointment, onClose }: AppointmentTicketDialogProps) {
  return (
    <Dialog open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Vaccination Ticket</DialogTitle>
        </DialogHeader>

        <DialogDescription className="sr-only">
          Detailed vaccination ticket for your appointment.
        </DialogDescription>

        {appointment && (
          <TicketCard
            appointmentId={String(appointment.id)}
            center={{
              name: appointment.centerName || "Unknown Center",
              address: appointment.centerAddress || "",
            }}
            vaccine={{
              name: appointment.vaccineName || "Unknown Vaccine",
            }}
            date={appointment.date}
            slot={appointment.slot}
            endTime={appointment.endTime}
            status={(appointment.status || "BOOKED").toLowerCase() as any}
            className="shadow-2xl mx-auto"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
