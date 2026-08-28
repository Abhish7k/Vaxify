import api from "./axios";
import type {
  UpdateProfileRequestDto,
  UserResponseDto,
  UserStatsDto,
} from "@/api/dto/user";
import { mapUserProfile, mapUserStats } from "@/api/mappers/user";
import type { UserProfile, UserStats } from "@/types/user";

export type { UserProfile, UserStats };

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserResponseDto>("/users/profile");
    return mapUserProfile(response.data);
  },

  updateProfile: async (data: UpdateProfileRequestDto): Promise<UserProfile> => {
    const response = await api.patch<UserResponseDto>("/users/profile", data);
    return mapUserProfile(response.data);
  },

  getStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStatsDto>("/users/stats");
    return mapUserStats(response.data);
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get<UserResponseDto[]>("/admin/users");
    return (response.data || []).map(mapUserProfile);
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};
