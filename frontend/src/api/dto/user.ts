import type { AppointmentResponseDto } from "./appointment";

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface UserStatsDto {
  upcomingAppointmentDate: string;
  vaccinationStatus: string;
  totalAppointments: number;
  pendingAppointments?: number;
  completedAppointments: number;
  recentAppointments?: AppointmentResponseDto[];
}

export interface UpdateProfileRequestDto {
  name?: string;
  phone?: string;
}
