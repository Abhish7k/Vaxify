import type { UserResponseDto, UserStatsDto } from "@/api/dto/user";
import { toRole } from "@/types/auth";
import type { UserProfile, UserStats } from "@/types/user";
import { mapUserAppointment } from "./appointment";

export function mapUserProfile(dto: UserResponseDto): UserProfile {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: toRole(dto.role),
    createdAt: dto.createdAt,
  };
}

export function mapUserStats(dto: UserStatsDto): UserStats {
  return {
    upcomingAppointmentDate: dto.upcomingAppointmentDate,
    vaccinationStatus: dto.vaccinationStatus,
    totalAppointments: dto.totalAppointments,
    completedAppointments: dto.completedAppointments,
    recentAppointments: (dto.recentAppointments || []).map(mapUserAppointment),
  };
}
