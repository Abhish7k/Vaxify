import type { UpdateStockRequest, Vaccine } from "@/types/vaccine";

import api from "./axios";

export const vaccineApi = {
  // get all vaccines
  getVaccines: async (): Promise<Vaccine[]> => {
    const response = await api.get<Vaccine[]>("/vaccines");

    return response.data;
  },

  // get vaccines by hospital id
  getVaccinesByHospitalId: async (hospitalId: string): Promise<Vaccine[]> => {
    const response = await api.get<Vaccine[]>(
      `/vaccines/hospital/${hospitalId}`,
    );

    return response.data;
  },

  // get vaccines for logged-in staff's hospital
  getMyVaccines: async (): Promise<Vaccine[]> => {
    const response = await api.get<Vaccine[]>("/vaccines/staff");

    return response.data;
  },

  // add new vaccine
  addVaccine: async (
    vaccine: Omit<Vaccine, "id" | "lastUpdated">,
  ): Promise<Vaccine> => {
    const response = await api.post<Vaccine>("/vaccines/staff", vaccine);

    return response.data;
  },

  // update stock
  updateStock: async (request: UpdateStockRequest): Promise<Vaccine> => {
    const response = await api.put<Vaccine>(
      `/vaccines/staff/${request.vaccineId}`,
      { stock: request.quantity },
    );

    return response.data;
  },

  // delete vaccine
  deleteVaccine: async (id: string): Promise<void> => {
    await api.delete(`/vaccines/staff/${id}`);
  },

  // get low stock alerts
  getLowStockAlerts: async (): Promise<Vaccine[]> => {
    const response = await api.get<Vaccine[]>("/vaccines/alerts");

    return response.data;
  },
};
