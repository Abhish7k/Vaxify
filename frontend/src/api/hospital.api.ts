import { API_CONFIG } from "@/api/api.config";
import api from "./axios";
import { type Center, centersData } from "@/constants/centers-mock-data";

export const hospitalApi = {
  // get all hospitals
  getAllHospitals: async (): Promise<Center[]> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.HOSPITAL) {
      console.log("[mock api] fetching all hospitals...");

      await new Promise((resolve) => setTimeout(resolve, 200));

      return [...centersData];
    }

    const response = await api.get<Center[]>("/hospitals");

    return response.data;
  },

  // get hospital by id
  getHospitalById: async (id: string): Promise<Center | undefined> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.HOSPITAL) {
      console.log(`[mock api] fetching hospital details for ${id}...`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      return centersData.find((c) => c.id === id);
    }

    const response = await api.get<Center>(`/hospitals/${id}`);

    return response.data;
  },

  // register new hospital
  registerHospital: async (hospitalData: unknown) => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.HOSPITAL) {
      console.log("[mock api] registering new hospital...", hospitalData);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return;
    }

    await api.post("/hospitals", hospitalData);
  },
};
