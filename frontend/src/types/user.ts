import type { Role } from "./auth";
import type { Appointment } from "./appointment";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface UserStats {
  upcomingAppointmentDate: string;
  vaccinationStatus: string;
  totalAppointments: number;
  completedAppointments: number;
  recentAppointments: Appointment[];
}
