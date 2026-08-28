import type { AdminActivityDto, AdminStatsDto } from "@/api/dto/admin";
import type { AdminActivity, AdminStats } from "@/types/admin";

export function mapAdminStats(dto: AdminStatsDto): AdminStats {
  return {
    totalHospitals: dto.totalHospitals,
    pendingApprovals: dto.pendingApprovals,
    totalUsers: dto.totalUsers,
    activeCenters: dto.activeCenters,
    totalAppointments: dto.totalAppointments,
  };
}

export function mapAdminActivity(dto: AdminActivityDto): AdminActivity {
  return {
    id: dto.id,
    action: dto.action,
    target: dto.target,
    type: dto.type === "USER" ? "USER" : "HOSPITAL",
    status: dto.status,
    timestamp: dto.timestamp,
  };
}
