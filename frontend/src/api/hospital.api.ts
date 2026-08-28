import type { Center } from "@/types/hospital";
import type { Hospital } from "@/types/hospital";
import type { UpdateHospitalRequest } from "@/types/hospital";
import type {
  HospitalResponseDto,
  HospitalSummaryDto,
  UpdateHospitalRequestDto,
} from "@/api/dto/hospital";
import { mapHospital, mapHospitalSummary } from "@/api/mappers/hospital";
import api from "./axios";

export const hospitalApi = {
  getAllHospitals: async (): Promise<Center[]> => {
    const response = await api.get<HospitalSummaryDto[]>("/hospitals");
    return response.data.map(mapHospitalSummary);
  },

  getHospitalById: async (id: string): Promise<Hospital | undefined> => {
    const response = await api.get<HospitalResponseDto>(`/hospitals/${id}`);
    if (!response.data) return undefined;
    return mapHospital(response.data);
  },

  getAdminHospitalById: async (id: string): Promise<Hospital | undefined> => {
    const response = await api.get<HospitalResponseDto>(`/admin/hospitals/${id}`);
    if (!response.data) return undefined;
    return mapHospital(response.data);
  },

  getMyHospital: async (): Promise<Hospital> => {
    const response = await api.get<HospitalResponseDto>("/hospitals/my");
    return mapHospital(response.data);
  },

  updateHospital: async (data: UpdateHospitalRequest): Promise<Hospital> => {
    const response = await api.put<HospitalResponseDto>(
      "/hospitals/my",
      data satisfies UpdateHospitalRequestDto,
    );
    return mapHospital(response.data);
  },

  getAdminHospitals: async (): Promise<Hospital[]> => {
    const response = await api.get<HospitalResponseDto[]>("/admin/hospitals");
    return response.data.map(mapHospital);
  },

  approveHospital: async (id: string): Promise<void> => {
    await api.put(`/admin/hospitals/approve/${id}`);
  },

  rejectHospital: async (id: string): Promise<void> => {
    await api.put(`/admin/hospitals/reject/${id}`);
  },

  deleteHospital: async (id: string): Promise<void> => {
    await api.delete(`/admin/hospitals/${id}`);
  },
};
