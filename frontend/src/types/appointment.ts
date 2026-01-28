export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  userId: string;
  centerId: string;
  vaccineId: string;
  date: string;
  slot: string;
  status: AppointmentStatus;
  createdAt: string;

  // populated fields
  centerName?: string;
  centerAddress?: string;
  vaccineName?: string;
}

export interface BookAppointmentRequest {
  centerId: string;
  vaccineId: string;
  date: string;
  slot: string;
  // userId is handled by token in backend
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
