import api from "./axios";
import type { AdminActivityDto, AdminStatsDto } from "@/api/dto/admin";
import type { HospitalResponseDto } from "@/api/dto/hospital";
import { mapAdminActivity, mapAdminStats } from "@/api/mappers/admin";
import { mapHospital } from "@/api/mappers/hospital";
import type { AdminActivity, AdminStats } from "@/types/admin";
import type { Hospital } from "@/types/hospital";

export type { AdminStats };

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStatsDto>("/admin/stats");
    return mapAdminStats(response.data);
  },

  getPendingHospitals: async (): Promise<Hospital[]> => {
    const response = await api.get<HospitalResponseDto[]>("/admin/hospitals/pending");
    return response.data.map(mapHospital);
  },

  getActivities: async (): Promise<AdminActivity[]> => {
    const response = await api.get<AdminActivityDto[]>("/admin/stats/activities");
    return response.data.map(mapAdminActivity);
  },
};
