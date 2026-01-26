import { mockStaffAppointments } from "@/components/appointment/staff/mockdata";
import StaffAppointmentsHeaderSection from "@/components/appointment/staff/StaffAppointmentsHeaderSection";
import StaffAppointmentsListSection, {
  type StaffAppointment,
} from "@/components/appointment/staff/StaffAppointmentsListSection";
import type { StaffAppointmentStatus } from "@/components/appointment/staff/StaffAppointmentsTabsSection";
import StaffAppointmentsTabsSection from "@/components/appointment/staff/StaffAppointmentsTabsSection";
import { useState } from "react";
import { toast } from "sonner";

export default function StaffAppointmentsPage() {
  const [activeStatus, setActiveStatus] =
    useState<StaffAppointmentStatus>("UPCOMING");

  const [appointments, setAppointments] = useState<StaffAppointment[]>(
    mockStaffAppointments,
  );

  const handleMarkCompleted = (appointment: StaffAppointment) => {
    console.log("Mark completed:", appointment.id);

    toast.success("Marked appointment as completed", {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });
  };

  const handleCancelAppointment = (appointment: StaffAppointment) => {
    console.log("Mark completed:", appointment.id);

    toast.success("Cancelled appointment successfully", {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <StaffAppointmentsHeaderSection />

      <StaffAppointmentsTabsSection
        value={activeStatus}
        onChange={setActiveStatus}
      />

      <StaffAppointmentsListSection
        appointments={mockStaffAppointments}
        activeStatus={activeStatus}
        onMarkCompleted={(appointment) => handleMarkCompleted(appointment)}
        onCancelAppointment={(appointment) =>
          handleCancelAppointment(appointment)
        }
      />
    </div>
  );
}
