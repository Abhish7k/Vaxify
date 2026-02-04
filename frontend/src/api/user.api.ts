import api from "./axios";

export interface UserStats {
  upcomingAppointmentDate: string;
  vaccinationStatus: string;
  totalAppointments: number;
  completedAppointments: number;
  certificateAvailable: boolean;
  recentAppointments: any[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>("/users/profile");

    return response.data;
  },

  getStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>("/users/stats");

    const stats = response.data;

    if (stats.recentAppointments) {
      stats.recentAppointments = stats.recentAppointments.map((a: any) => ({
        ...a,
        centerId: String(a.hospitalId || a.centerId),
      }));
    }

    return stats;
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get<UserProfile[]>("/admin/users");

    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};
