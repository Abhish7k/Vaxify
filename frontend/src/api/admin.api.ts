import api from "./axios";

export interface AdminStats {
  totalHospitals: number;
  pendingApprovals: number;
  totalUsers: number;
  activeCenters: number;
  totalAppointments: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>("/admin/stats");
    return response.data;
  },

  getPendingHospitals: async (): Promise<any[]> => {
    const response = await api.get<any[]>("/admin/hospitals/pending");
    return response.data;
  },

  getActivities: async (): Promise<any[]> => {
    const response = await api.get<any[]>("/admin/stats/activities");
    return response.data;
  },
};
