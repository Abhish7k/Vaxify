import StaffAppointmentsHeaderSection from "@/components/appointment/staff/StaffAppointmentsHeaderSection";
import type { Appointment as StaffAppointment } from "@/types/appointment";
import type { StaffAppointmentStatus } from "@/components/appointment/staff/StaffAppointmentsTabsSection";
import StaffAppointmentsTabsSection from "@/components/appointment/staff/StaffAppointmentsTabsSection";
import StaffAppointmentsListSection from "@/components/appointment/staff/StaffAppointmentsListSection";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { hospitalApi } from "@/api/hospital.api";
import { appointmentApi } from "@/api/appointment.api";
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

export default function StaffAppointmentsPage() {
  const [activeStatus, setActiveStatus] =
    useState<StaffAppointmentStatus>("UPCOMING");

  const [appointments, setAppointments] = useState<StaffAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "complete" | "cancel" | null
  >(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<StaffAppointment | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const hospital = await hospitalApi.getMyHospital();
      if (!hospital) {
        return;
      }

      const data = await appointmentApi.getStaffAppointments(hospital.id);

      const mappedData = data.map((appt: any) => {
        let status = appt.status;
        const s = (appt.status || "").toUpperCase();

        if (s === "SCHEDULED" || s === "BOOKED" || s === "UPCOMING") {
          status = "UPCOMING";
        } else if (s === "COMPLETED") {
          status = "COMPLETED";
        } else if (s === "CANCELLED") {
          status = "CANCELLED";
        }

        return {
          ...appt,
          vaccine: appt.vaccineName || appt.vaccine || "Unknown",
          status: status,
        };
      });

      setAppointments(mappedData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleActionRequest = (
    appointment: StaffAppointment,
    action: "complete" | "cancel",
  ) => {
    setSelectedAppointment(appointment);
    setPendingAction(action);
    setIsAlertOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedAppointment || !pendingAction) return;

    try {
      setActionLoading(true);
      if (pendingAction === "complete") {
        await appointmentApi.completeAppointment(selectedAppointment.id);
        toast.success("Appointment marked as completed");
      } else {
        await appointmentApi.cancelAppointment(selectedAppointment.id);
        toast.success("Appointment cancelled successfully");
      }
      fetchAppointments();
    } catch (error) {
      toast.error(
        `Failed to ${pendingAction === "complete" ? "complete" : "cancel"} appointment`,
      );
    } finally {
      setActionLoading(false);
      setIsAlertOpen(false);
      setPendingAction(null);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StaffAppointmentsHeaderSection />

      <StaffAppointmentsTabsSection
        value={activeStatus}
        onChange={setActiveStatus}
      />

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading appointments...
        </div>
      ) : (
        <StaffAppointmentsListSection
          appointments={appointments}
          activeStatus={activeStatus}
          onMarkCompleted={(appointment) =>
            handleActionRequest(appointment, "complete")
          }
          onCancelAppointment={(appointment) =>
            handleActionRequest(appointment, "cancel")
          }
        />
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "complete"
                ? "Complete Appointment?"
                : "Cancel Appointment?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {pendingAction === "complete"
                ? `Are you sure you want to mark the appointment for ${selectedAppointment?.patientName} as completed? This will deduct 1 unit from your vaccine inventory.`
                : `Are you sure you want to cancel the appointment for ${selectedAppointment?.patientName}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmAction();
              }}
              disabled={actionLoading}
              className={
                pendingAction === "cancel"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
