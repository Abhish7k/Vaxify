import api from "./axios";
import type { AppointmentResponseDto, BookAppointmentRequestDto } from "@/api/dto/appointment";
import type { SlotResponseDto } from "@/api/dto/slot";
import { mapStaffAppointment, mapUserAppointment } from "@/api/mappers/appointment";
import { mapBookingSlot } from "@/api/mappers/slot";
import type {
  Appointment,
  BookAppointmentRequest,
  HospitalTimeSlot,
} from "@/types/appointment";

export const appointmentApi = {
  getHospitalSlots: async (hospitalId: string): Promise<HospitalTimeSlot[]> => {
    const response = await api.get<SlotResponseDto[]>(`/slots/hospital/${hospitalId}`);
    return response.data.map(mapBookingSlot);
  },

  bookAppointment: async (data: BookAppointmentRequest): Promise<Appointment> => {
    const response = await api.post<AppointmentResponseDto>(
      "/appointments",
      data satisfies BookAppointmentRequestDto,
    );
    return mapUserAppointment(response.data);
  },

  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<AppointmentResponseDto[]>("/appointments/my");
    return response.data.map(mapUserAppointment);
  },

  cancelAppointment: async (appointmentId: string): Promise<void> => {
    await api.patch(`/appointments/${appointmentId}/cancel`);
  },

  getStaffAppointments: async (hospitalId: string): Promise<Appointment[]> => {
    const response = await api.get<AppointmentResponseDto[]>(
      `/appointments/hospital/${hospitalId}`,
    );
    return response.data.map(mapStaffAppointment);
  },

  completeAppointment: async (appointmentId: string): Promise<void> => {
    await api.patch(`/appointments/${appointmentId}/complete`);
  },
};
