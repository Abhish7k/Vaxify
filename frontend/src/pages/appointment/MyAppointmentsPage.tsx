import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toastUtils } from "@/lib/toast";

import MyAppointmentsHeaderSection from "@/components/appointment/my-appointments/MyAppointmentsHeaderSection";
import MyAppointmentsTabsSection from "@/components/appointment/my-appointments/MyAppointmentsTabsSection";
import { type Appointment, type UserAppointmentTab } from "@/types/appointment";
import MyAppointmentsListSection from "@/components/appointment/my-appointments/MyAppointmentsListSection";
import { MyAppointmentsSkeleton } from "@/components/skeletons/MyAppointmentsSkeleton";

import AppointmentTicketDialog from "@/components/appointment/AppointmentTicketDialog";
import AppointmentCancelDialog from "@/components/appointment/AppointmentCancelDialog";
import { getErrorMessage } from "@/lib/errors";
import { useCancelAppointment, useMyAppointments } from "@/hooks/queries/use-appointments";
import { PageLoadError } from "@/components/ui/page-load-error";

export default function MyAppointmentsPage() {
  const navigate = useNavigate();

  const [activeStatus, setActiveStatus] = useState<UserAppointmentTab>("BOOKED");
  const [selectedTicket, setSelectedTicket] = useState<Appointment | null>(null);

  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const appointmentsQuery = useMyAppointments();
  const cancelMutation = useCancelAppointment();
  const appointments = appointmentsQuery.data ?? [];
  const isLoading = appointmentsQuery.isFetching;

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      await cancelMutation.mutateAsync(appointmentToCancel.id);

      toastUtils.success("Cancelled appointment successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to cancel appointment"));
    } finally {
      setIsCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  return (
    <div className="space-y-8 container mx-auto px-2 sm:px-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* header */}
      <MyAppointmentsHeaderSection
        onRefresh={() => void appointmentsQuery.refetch()}
        loading={isLoading}
      />

      {/* tabs */}
      <MyAppointmentsTabsSection value={activeStatus} onChange={setActiveStatus} />

      {/* list */}
      {isLoading ? (
        <MyAppointmentsSkeleton />
      ) : appointmentsQuery.isError ? (
        <PageLoadError
          message="Could not load appointments. Please try again."
          onRetry={() => void appointmentsQuery.refetch()}
        />
      ) : (
        <MyAppointmentsListSection
          appointments={appointments}
          activeStatus={activeStatus}
          onBrowseCenters={() => navigate("/centers")}
          onViewCenter={(centerId) => navigate(`/centers/${centerId}`)}
          onCancelAppointment={(appointment) => {
            const fullAppt = appointments.find((a) => a.id === appointment.id);
            if (fullAppt) {
              setAppointmentToCancel(fullAppt);
              setIsCancelDialogOpen(true);
            }
          }}
          onViewTicket={(appointmentId) => {
            const appointment = appointments.find((a) => a.id === appointmentId);
            if (appointment) setSelectedTicket(appointment);
          }}
        />
      )}

      <AppointmentTicketDialog appointment={selectedTicket} onClose={() => setSelectedTicket(null)} />

      <AppointmentCancelDialog
        appointment={appointmentToCancel}
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={confirmCancelAppointment}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}
