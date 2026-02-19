import api from "./axios";
import type {
  Appointment,
  BookAppointmentRequest,
  TimeSlot,
  HospitalTimeSlot,
} from "@/types/appointment";

export const appointmentApi = {
  // get all slots for a hospital
  getHospitalSlots: async (hospitalId: string): Promise<HospitalTimeSlot[]> => {
    const response = await api.get<any[]>(`/slots/hospital/${hospitalId}`);

    return response.data.map((s: any) => ({
      time: s.startTime,
      date: s.date,
      available: s.status === "AVAILABLE" && s.bookedCount < s.capacity,
    }));
  },

  // get available slots for a center on a specific date
  getSlots: async (centerId: string, date: string): Promise<TimeSlot[]> => {
    const formattedDate = date.includes("T") ? date.split("T")[0] : date;

    const response = await api.get<any[]>(`/slots/hospital/${centerId}/date`, {
      params: { date: formattedDate },
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
    const response = await api.post<any>("/appointments", data);

    const a = response.data;

    return {
      id: String(a.id),
      userId: String(a.userId),
      centerId: String(a.hospitalId || a.centerId),
      vaccineId: String(a.vaccineId),
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
    const response = await api.get<any[]>("/appointments/my");

    return response.data.map((a: any) => ({
      id: String(a.id),
      centerId: String(a.hospitalId || a.centerId),
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
    await api.patch(`/appointments/${appointmentId}/cancel`);
  },

  // get all appointments for a staff's hospital
  getStaffAppointments: async (hospitalId: string): Promise<Appointment[]> => {
    const response = await api.get<any[]>(
      `/appointments/hospital/${hospitalId}`,
    );

    return response.data.map((a: any) => {
      let status = a.status;

      if (status === "BOOKED" || status === "scheduled") status = "UPCOMING";

      return {
        id: String(a.id),
        patientName: a.patientName,
        patientPhone: a.patientPhone,
        patientEmail: a.patientEmail,
        vaccine: a.vaccineName,
        date: a.date,
        timeSlot: a.slot,
        status: status,
      };
    }) as any;
  },

  // complete appointment
  completeAppointment: async (appointmentId: string): Promise<void> => {
    await api.patch(`/appointments/${appointmentId}/complete`);
  },
};
