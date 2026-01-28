import { useState } from "react";

import MyAppointmentsHeaderSection from "@/components/appointment/my-appointments/MyAppointmentsHeaderSection";
import MyAppointmentsTabsSection, {
  type AppointmentStatus,
} from "@/components/appointment/my-appointments/MyAppointmentsTabsSection";
import type { Appointment } from "@/components/appointment/my-appointments/MyAppointmentsListSection";
import { mockAppointments } from "@/components/appointment/my-appointments/mock-data";
import MyAppointmentsListSection from "@/components/appointment/my-appointments/MyAppointmentsListSection";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TicketCard } from "@/components/appointment/TicketCard";

export default function MyAppointmentsPage() {
  const navigate = useNavigate();

  const [activeStatus, setActiveStatus] = useState<AppointmentStatus>("BOOKED");

  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);

  const [selectedTicket, setSelectedTicket] = useState<Appointment | null>(
    null,
  );

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointments(mockAppointments);

    toast.success("Cancelled appointment successfully", {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });

    console.log("Cancel:", appointment.id);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto mt-10 px-2 animate-in fade-in slide-in-from-bottom-10 duration-500">
      {/* header */}
      <MyAppointmentsHeaderSection />

      {/* tabs */}
      <MyAppointmentsTabsSection
        value={activeStatus}
        onChange={setActiveStatus}
      />

      {/* list */}
      <MyAppointmentsListSection
        appointments={appointments}
        activeStatus={activeStatus}
        onBrowseCenters={() => navigate("/centers")}
        onViewCenter={(centerId) => navigate(`/centers/${centerId}`)}
        onCancelAppointment={(appointment) =>
          handleCancelAppointment(appointment)
        }
        onViewTicket={(appointmentId) => {
          const appointment = appointments.find((a) => a.id === appointmentId);

          if (appointment) setSelectedTicket(appointment);
        }}
      />

      {/* ticket dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Vaccination Ticket</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <TicketCard
              appointmentId={selectedTicket.id}
              center={{
                name: selectedTicket.centerName,
                address: selectedTicket.centerAddress,
              }}
              vaccine={{
                name: selectedTicket.vaccine,
              }}
              date={selectedTicket.date}
              slot={selectedTicket.timeSlot}
              status={
                selectedTicket.status === "COMPLETED"
                  ? "completed"
                  : selectedTicket.status === "CANCELLED"
                    ? "cancelled"
                    : "scheduled"
              }
              className="shadow-2xl mx-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
