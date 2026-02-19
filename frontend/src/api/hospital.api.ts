import type { Center } from "@/types/hospital";
import api from "./axios";

export const hospitalApi = {
  // get all hospitals
  getAllHospitals: async (): Promise<Center[]> => {
    const response = await api.get<any[]>("/hospitals");

    return response.data.map((h: any) => ({
      id: String(h.id),
      name: h.name,
      address: h.address,
      // Handle either the full DTO or the summary DTO
      availableVaccines: h.availableVaccineNames || (h.availableVaccines || []).map((v: any) => v.name),
      staffEmail: h.staffEmail,
      staffPhone: h.staffPhone,
    }));
  },

  // get hospital by id
  getHospitalById: async (id: string): Promise<Center | undefined> => {
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
    await api.post("/hospitals/register", hospitalData);
  },

  // get my hospital (for staff)
  getMyHospital: async (): Promise<any> => {
    const response = await api.get<any>("/hospitals/my");

    return response.data;
  },

  // update hospital details (for staff)
  updateHospital: async (data: any): Promise<any> => {
    const response = await api.put<any>("/hospitals/my", data);

    return response.data;
  },

  // admin
  getAdminHospitals: async (): Promise<any[]> => {
    const response = await api.get<any[]>("/admin/hospitals");

    // map to ensure types
    return response.data.map((h) => ({
      ...h,
      id: String(h.id),
    }));
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
