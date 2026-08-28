import { parseDateOnly } from "@/lib/utils";

export type AppointmentStatus =
  | "BOOKED"
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export type UserAppointmentTab = "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED";

export type StaffAppointmentTab =
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export type TicketStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  userId?: string;
  centerId: string;
  vaccineId?: string;
  date: string;
  slot: string;
  endTime?: string;
  status: AppointmentStatus;
  createdAt?: string;

  centerName: string;
  centerAddress: string;
  vaccineName: string;
  vaccine: string;
  timeSlot: string;

  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
}

export interface BookAppointmentRequest {
  centerId: string;
  vaccineId: string;
  date: string;
  slot: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface HospitalTimeSlot extends TimeSlot {
  date: string;
}

export function toAppointmentStatus(
  raw: string | undefined | null,
  audience: "user" | "staff" = "user",
): AppointmentStatus {
  const status = (raw || "").toUpperCase();

  if (status === "COMPLETED") return "COMPLETED";
  if (status === "CANCELLED") return "CANCELLED";
  if (status === "MISSED") return "MISSED";

  return audience === "staff" ? "UPCOMING" : "BOOKED";
}

export function isUpcomingStatus(status: AppointmentStatus) {
  return status === "BOOKED" || status === "UPCOMING";
}

export function isAppointmentCancellable(appointment: {
  status: AppointmentStatus;
  date: string;
  slot: string;
}) {
  if (appointment.status !== "BOOKED" && appointment.status !== "UPCOMING") {
    return false;
  }

  const start = getAppointmentDateTime(appointment.date, appointment.slot);
  return start != null && start.getTime() > Date.now();
}

export function isAppointmentCompletable(appointment: {
  status: AppointmentStatus;
  date: string;
  slot: string;
}) {
  if (appointment.status !== "BOOKED" && appointment.status !== "UPCOMING") {
    return false;
  }

  const start = getAppointmentDateTime(appointment.date, appointment.slot);
  return start != null && start.getTime() <= Date.now();
}

export function getAppointmentDateTime(date: string, time: string) {
  if (!date || !time || time === "N/A") return null;

  const day = parseDateOnly(date);
  if (Number.isNaN(day.getTime())) return null;

  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const start = new Date(day);
  start.setHours(hours, minutes, 0, 0);
  return start;
}

export function toTicketStatus(status: unknown): TicketStatus {
  const raw = String(status ?? "").toLowerCase();

  if (raw === "completed") return "completed";
  if (raw === "cancelled" || raw === "rejected") return "cancelled";
  if (raw === "booked" || raw === "scheduled" || raw === "upcoming") {
    return "scheduled";
  }

  return "scheduled";
}

export function matchesStaffAppointmentTab(
  status: AppointmentStatus,
  tab: StaffAppointmentTab,
) {
  if (tab === "UPCOMING") return isUpcomingStatus(status);
  return status === tab;
}
