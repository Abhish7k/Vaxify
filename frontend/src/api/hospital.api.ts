import { API_CONFIG } from "@/api/api.config";
import api from "./axios";
import { type Center, centersData } from "@/constants/centers-mock-data";

export const hospitalApi = {
  // get all hospitals
  getAllHospitals: async (): Promise<Center[]> => {
    if (API_CONFIG.USE_MOCKS) {
      console.log("[mock api] fetching all hospitals...");
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [...centersData];
    }

    const response = await api.get<any[]>("/hospitals");

    return response.data.map((h: any) => ({
      id: String(h.id),
      name: h.name,
      address: h.address,
      availableVaccines: (h.availableVaccines || []).map((v: any) => v.name),
      staffEmail: h.staffEmail,
      staffPhone: h.staffPhone,
    }));
  },

  // get hospital by id
  getHospitalById: async (id: string): Promise<Center | undefined> => {
    if (API_CONFIG.USE_MOCKS) {
      console.log(`[mock api] fetching hospital details for ${id}...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return centersData.find((c) => c.id === id);
    }

    const response = await api.get<any>(`/hospitals/${id}`);

    if (!response.data) return undefined;

    return {
      ...response.data,
      id: String(response.data.id),
      // keep availableVaccines as string[] for compatibility with Center type
      availableVaccines: (response.data.availableVaccines || []).map(
        (v: any) => v.name,
      ),
      // add rawVaccines for detailed view
      vaccines: response.data.availableVaccines,
    } as any;
  },

  // register new hospital
  registerHospital: async (hospitalData: unknown) => {
    if (API_CONFIG.USE_MOCKS) {
      console.log("[mock api] registering new hospital...", hospitalData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }

    await api.post("/hospitals/register", hospitalData);
  },

  // get my hospital (for staff)
  getMyHospital: async (): Promise<any> => {
    if (API_CONFIG.USE_MOCKS) {
      return centersData[0];
    }

    const response = await api.get<any>("/hospitals/my");
    return response.data;
  },

  // update hospital details (for staff)
  updateHospital: async (data: any): Promise<any> => {
    if (API_CONFIG.USE_MOCKS) {
      console.log("[mock api] updating hospital...", data);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return data;
    }

    const response = await api.put<any>("/hospitals/my", data);
    return response.data;
  },

  // admin
  getAdminHospitals: async (): Promise<any[]> => {
    if (API_CONFIG.USE_MOCKS) {
      // return mocks or empty
      return [];
    }
    const response = await api.get<any[]>("/admin/hospitals");
    // map to ensure types
    return response.data.map((h) => ({
      ...h,
      id: String(h.id),
    }));
  },

  approveHospital: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCKS) {
      return;
    }
    await api.put(`/admin/hospitals/approve/${id}`);
  },

  rejectHospital: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCKS) {
      return;
    }
    await api.put(`/admin/hospitals/reject/${id}`);
  },

  deleteHospital: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCKS) {
      return;
    }
    await api.delete(`/admin/hospitals/${id}`);
  },
};
