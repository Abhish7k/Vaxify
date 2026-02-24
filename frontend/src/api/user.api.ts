import api from "./axios";

export interface UserStats {
  upcomingAppointmentDate: string;
  vaccinationStatus: string;
  totalAppointments: number;
  completedAppointments: number;
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

    if (response.data) {
      response.data.role = response.data.role.toLowerCase();
    }

    return response.data;
  },

  updateProfile: async (data: { name?: string; phone?: string }): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>("/users/profile", data);

    if (response.data) {
      response.data.role = response.data.role.toLowerCase();
    }

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

    if (response.data) {
      return response.data.map((u) => ({
        ...u,
        role: u.role.toLowerCase(),
      }));
    }

    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};
