import StaffAppointmentsHeaderSection from "@/components/appointment/staff/StaffAppointmentsHeaderSection";
import type { Appointment as StaffAppointment } from "@/types/appointment";
import type { StaffAppointmentStatus } from "@/components/appointment/staff/StaffAppointmentsTabsSection";
import StaffAppointmentsTabsSection from "@/components/appointment/staff/StaffAppointmentsTabsSection";
import StaffAppointmentsListSection from "@/components/appointment/staff/StaffAppointmentsListSection";
import { useState } from "react";
import { toastUtils } from "@/lib/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useMyHospital } from "@/hooks/queries/use-hospitals";
import {
  useCancelAppointment,
  useCompleteAppointment,
  useStaffAppointments,
} from "@/hooks/queries/use-appointments";
import { getErrorMessage } from "@/lib/errors";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { PageLoadError } from "@/components/ui/page-load-error";

export default function StaffAppointmentsPage() {
  const [activeStatus, setActiveStatus] = useState<StaffAppointmentStatus>("UPCOMING");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"complete" | "cancel" | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<StaffAppointment | null>(null);

  const hospitalQuery = useMyHospital();
  const hospitalId = hospitalQuery.data?.id ? String(hospitalQuery.data.id) : undefined;
  const appointmentsQuery = useStaffAppointments(hospitalId);
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();

  const loading = hospitalQuery.isFetching || appointmentsQuery.isFetching;
  const actionLoading = completeMutation.isPending || cancelMutation.isPending;

  const appointments = appointmentsQuery.data ?? [];
  const canMutate = hospitalQuery.data?.status === "APPROVED";
  const loadError = hospitalQuery.isError || appointmentsQuery.isError;

  useQueryErrorToast(
    appointmentsQuery.isError || hospitalQuery.isError,
    "Failed to load appointments",
    appointmentsQuery.error ?? hospitalQuery.error,
  );

  const handleActionRequest = (appointment: StaffAppointment, action: "complete" | "cancel") => {
    setSelectedAppointment(appointment);
    setPendingAction(action);
    setIsAlertOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedAppointment || !pendingAction) return;

    try {
      if (pendingAction === "complete") {
        await completeMutation.mutateAsync(selectedAppointment.id);
        toastUtils.success("Appointment marked as completed");
      } else {
        await cancelMutation.mutateAsync(selectedAppointment.id);
        toastUtils.success("Appointment cancelled successfully");
      }
    } catch (error) {
      toastUtils.error(
        getErrorMessage(
          error,
          `Failed to ${pendingAction === "complete" ? "complete" : "cancel"} appointment`,
        ),
      );
    } finally {
      setIsAlertOpen(false);
      setPendingAction(null);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StaffAppointmentsHeaderSection
        onRefresh={() => {
          void hospitalQuery.refetch();
          void appointmentsQuery.refetch();
        }}
        loading={loading}
      />

      <StaffAppointmentsTabsSection value={activeStatus} onChange={setActiveStatus} />

      {loading ? (
        <div className="p-20 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading appointments...
        </div>
      ) : loadError ? (
        <PageLoadError
          message="Could not load appointments. Please try again."
          onRetry={() => {
            void hospitalQuery.refetch();
            void appointmentsQuery.refetch();
          }}
        />
      ) : (
        <StaffAppointmentsListSection
          appointments={appointments}
          activeStatus={activeStatus}
          canMutate={canMutate}
          onMarkCompleted={(appointment) => handleActionRequest(appointment, "complete")}
          onCancelAppointment={(appointment) => handleActionRequest(appointment, "cancel")}
        />
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "complete" ? "Complete Appointment?" : "Cancel Appointment?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {pendingAction === "complete"
                ? `Are you sure you want to mark the appointment for ${selectedAppointment?.patientName} as completed? This will deduct 1 unit from your vaccine inventory.`
                : `Are you sure you want to cancel the appointment for ${selectedAppointment?.patientName}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmAction();
              }}
              disabled={actionLoading}
              className={
                pendingAction === "cancel"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
