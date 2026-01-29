import { API_CONFIG } from "./api.config";
import api from "./axios";
import type {
  Appointment,
  BookAppointmentRequest,
  TimeSlot,
} from "@/types/appointment";

export const appointmentApi = {
  // get available slots for a center on a specific date
  getSlots: async (centerId: string, date: string): Promise<TimeSlot[]> => {
    if (API_CONFIG.USE_MOCKS) {
      console.log(
        `[mock api] fetching slots for center ${centerId} on ${date}...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;
      for (let i = startHour; i < endHour; i++) {
        const time = `${i.toString().padStart(2, "0")}:00`;
        const available = Math.random() > 0.3;
        slots.push({ time, available });
      }
      return slots;
    }

    const response = await api.get<any[]>(`/slots/hospital/${centerId}/date`, {
      params: { date },
    });

    return response.data.map((s: any) => ({
      time: s.startTime,
      available: s.status === "AVAILABLE" || s.bookedCount < s.capacity,
    }));
  },

  // book a new appointment
  bookAppointment: async (
    data: BookAppointmentRequest,
  ): Promise<Appointment> => {
    if (API_CONFIG.USE_MOCKS) {
      console.log("[mock api] booking appointment...", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: `apt_${Date.now()}`,
        userId: "user_1",
        centerId: data.centerId,
        vaccineId: data.vaccineId,
        date: data.date,
        slot: data.slot,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        centerName: "Mock Hospital",
        vaccineName: "Mock Vaccine",
      } as any;
    }

    const response = await api.post<any>("/appointments", data);
    const a = response.data;
    return {
      id: String(a.id),
      userId: "", // normalized
      centerId: "", // normalized
      vaccineId: "", // normalized
      date: a.date,
      slot: a.slot,
      status: a.status.toLowerCase(),
      createdAt: a.createdAt,
      centerName: a.centerName,
      centerAddress: a.centerAddress,
      vaccineName: a.vaccineName,
    } as any;
  },

  // get current user's appointments
  getMyAppointments: async (): Promise<Appointment[]> => {
    if (API_CONFIG.USE_MOCKS) {
      return [];
    }

    const response = await api.get<any[]>("/appointments/my");
    return response.data.map((a: any) => ({
      id: String(a.id),
      date: a.date,
      slot: a.slot,
      status: a.status.toLowerCase(),
      createdAt: a.createdAt,
      centerName: a.centerName,
      centerAddress: a.centerAddress,
      vaccineName: a.vaccineName,
    })) as any;
  },

  // cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<void> => {
    if (API_CONFIG.USE_MOCKS) {
      return;
    }
    await api.patch(`/appointments/${appointmentId}/cancel`);
  },
};
