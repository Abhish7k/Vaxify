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
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.APPOINTMENT) {
      console.log(
        `[mock api] fetching slots for center ${centerId} on ${date}...`,
      );

      await new Promise((resolve) => setTimeout(resolve, 600));

      // generate deterministic mock slots based on date
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;

      for (let i = startHour; i < endHour; i++) {
        const time = `${i.toString().padStart(2, "0")}:00`;
        // random availability
        const available = Math.random() > 0.3;

        slots.push({ time, available });
      }

      return slots;
    }

    const response = await api.get<TimeSlot[]>(
      `/appointments/slots?centerId=${centerId}&date=${date}`,
    );

    return response.data;
  },

  // book a new appointment
  bookAppointment: async (
    data: BookAppointmentRequest,
  ): Promise<Appointment> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.APPOINTMENT) {
      console.log("[mock api] booking appointment...", data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newAppointment: Appointment = {
        id: `apt_${Date.now()}`,
        userId: "user_1", // mock user id
        centerId: data.centerId,
        vaccineId: data.vaccineId,
        date: data.date,
        slot: data.slot,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        // these would normally come populated from backend
        centerName: "City Health Vaccination Center",
        vaccineName: "Covishield",
      };

      // add to local mock store (persists only in memory for current session)
      mockAppointments.unshift(newAppointment);

      return newAppointment;
    }

    const response = await api.post<Appointment>("/appointments", data);

    return response.data;
  },

  // get current user's appointments
  getMyAppointments: async (): Promise<Appointment[]> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.APPOINTMENT) {
      console.log("[mock api] fetching user appointments...");

      await new Promise((resolve) => setTimeout(resolve, 800));

      return [...mockAppointments];
    }

    const response = await api.get<Appointment[]>("/appointments/my");

    return response.data;
  },

  // cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<void> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.APPOINTMENT) {
      console.log(`[mock api] cancelling appointment ${appointmentId}...`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockAppointments.findIndex((a) => a.id === appointmentId);

      if (index !== -1) {
        mockAppointments[index].status = "cancelled";
      }

      return;
    }

    await api.patch(`/appointments/${appointmentId}/cancel`);
  },
};

// local memory mock data
const mockAppointments: Appointment[] = [
  {
    id: "apt_mock_1",
    userId: "user_1",
    centerId: "1",
    vaccineId: "covishield",
    date: new Date().toISOString(),
    slot: "10:00",
    status: "scheduled",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    centerName: "City Health Vaccination Center",
    vaccineName: "Covishield",
    centerAddress: "MG Road, Pune",
  },
  {
    id: "apt_mock_2",
    userId: "user_1",
    centerId: "center-2",
    vaccineId: "covaxin",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    slot: "14:00",
    status: "completed",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    centerName: "Community Care Hospital",
    vaccineName: "Covaxin",
    centerAddress: "Kalyani Nagar, Pune",
  },
];
