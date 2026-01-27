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

export default function MyAppointmentsPage() {
  const navigate = useNavigate();

  const [activeStatus, setActiveStatus] = useState<AppointmentStatus>("BOOKED");

  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);

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
      />
    </div>
  );
}
