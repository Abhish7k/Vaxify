import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentApi } from "@/api/appointment.api";
import { queryKeys } from "@/lib/query-keys";
import type { BookAppointmentRequest } from "@/types/appointment";

export function useMyAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments.mine(),
    queryFn: () => appointmentApi.getMyAppointments(),
  });
}

export function useStaffAppointments(hospitalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.appointments.staff(hospitalId ?? ""),
    queryFn: () => appointmentApi.getStaffAppointments(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

export function useBookingSlots(hospitalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.slots.booking(hospitalId ?? ""),
    queryFn: () => appointmentApi.getHospitalSlots(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

function invalidateAppointmentCaches(client: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    client.invalidateQueries({ queryKey: queryKeys.slots.all }),
    client.invalidateQueries({ queryKey: queryKeys.vaccines.all }),
    client.invalidateQueries({ queryKey: queryKeys.users.stats() }),
  ]);
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookAppointmentRequest) =>
      appointmentApi.bookAppointment(data),
    onSuccess: () => {
      void invalidateAppointmentCaches(queryClient);
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentApi.cancelAppointment(appointmentId),
    onSuccess: () => {
      void invalidateAppointmentCaches(queryClient);
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentApi.completeAppointment(appointmentId),
    onSuccess: () => {
      void invalidateAppointmentCaches(queryClient);
    },
  });
}
