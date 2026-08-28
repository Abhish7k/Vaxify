import type { VaccineRequestDto } from "@/api/dto/vaccine";
import type { VaccineResponseDto } from "@/api/dto/hospital";
import { mapVaccine } from "@/api/mappers/vaccine";
import type { UpdateStockRequest, Vaccine } from "@/types/vaccine";
import api from "./axios";

export const vaccineApi = {
  getVaccines: async (): Promise<Vaccine[]> => {
    const response = await api.get<VaccineResponseDto[]>("/vaccines");
    return response.data.map(mapVaccine);
  },

  getVaccinesByHospitalId: async (hospitalId: string): Promise<Vaccine[]> => {
    const response = await api.get<VaccineResponseDto[]>(
      `/vaccines/hospital/${hospitalId}`,
    );
    return response.data.map(mapVaccine);
  },

  getMyVaccines: async (): Promise<Vaccine[]> => {
    const response = await api.get<VaccineResponseDto[]>("/vaccines/staff");
    return response.data.map(mapVaccine);
  },

  addVaccine: async (
    vaccine: Omit<Vaccine, "id" | "lastUpdated">,
  ): Promise<Vaccine> => {
    const response = await api.post<VaccineResponseDto>(
      "/vaccines/staff",
      {
        name: vaccine.name,
        type: vaccine.type,
        manufacturer: vaccine.manufacturer,
        stock: vaccine.stock,
        capacity: vaccine.capacity,
      } satisfies VaccineRequestDto,
    );
    return mapVaccine(response.data);
  },

  updateStock: async (request: UpdateStockRequest): Promise<Vaccine> => {
    const response = await api.put<VaccineResponseDto>(
      `/vaccines/staff/${request.vaccineId}`,
      { stock: request.quantity },
    );
    return mapVaccine(response.data);
  },

  deleteVaccine: async (id: string): Promise<void> => {
    await api.delete(`/vaccines/staff/${id}`);
  },

  getLowStockAlerts: async (): Promise<Vaccine[]> => {
    const response = await api.get<VaccineResponseDto[]>("/vaccines/alerts");
    return response.data.map(mapVaccine);
  },
};
