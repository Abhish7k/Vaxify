import type { UpdateStockRequest, Vaccine } from "@/types/vaccine";

import { API_CONFIG } from "@/api/api.config";
import api from "./axios";

export const vaccineApi = {
  // get all vaccines
  getVaccines: async (): Promise<Vaccine[]> => {
    // check config for mock mode
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.VACCINE) {
      console.log("[Mock API] Fetching vaccines...");

      await new Promise((resolve) => setTimeout(resolve, 500));

      return [...mockVaccines];
    }

    // real api call
    try {
      const response = await api.get<Vaccine[]>("/vaccines");

      return response.data;
    } catch (error) {
      console.error("Error fetching vaccines from API:", error);

      throw error;
    }
  },

  // add new vaccine
  addVaccine: async (
    vaccine: Omit<Vaccine, "id" | "lastUpdated">,
  ): Promise<Vaccine> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.VACCINE) {
      console.log("[Mock API] Adding vaccine...", vaccine);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const newVaccine: Vaccine = {
        ...vaccine,

        id: `v${mockVaccines.length + 1}`,

        lastUpdated: new Date().toISOString(),
      };
      mockVaccines.push(newVaccine);

      return newVaccine;
    }

    const response = await api.post<Vaccine>("/vaccines", vaccine);
    return response.data;
  },

  // update stock
  updateStock: async (request: UpdateStockRequest): Promise<Vaccine> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.VACCINE) {
      console.log("[Mock API] Updating stock...", request);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockVaccines.findIndex((v) => v.id === request.vaccineId);

      if (index === -1) {
        throw new Error("Vaccine not found");
      }

      mockVaccines[index] = {
        ...mockVaccines[index],

        stock: request.quantity,

        lastUpdated: new Date().toISOString(),
      };

      return mockVaccines[index];
    }

    const response = await api.patch<Vaccine>(
      `/vaccines/${request.vaccineId}/stock`,

      { stock: request.quantity },
    );

    return response.data;
  },

  // delete vaccine
  deleteVaccine: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.VACCINE) {
      console.log("[Mock API] Deleting vaccine...", id);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockVaccines.findIndex((v) => v.id === id);

      if (index === -1) {
        throw new Error("Vaccine not found");
      }

      mockVaccines.splice(index, 1);

      return;
    }

    await api.delete(`/vaccines/${id}`);
  },

  // get low stock alerts
  getLowStockAlerts: async (): Promise<Vaccine[]> => {
    if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.VACCINE) {
      // simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return mockVaccines.filter((v) => v.stock / v.capacity < 0.5);
    }

    const response = await api.get<Vaccine[]>("/vaccines/alerts");

    return response.data;
  },
};

// mock data for vaccines
const mockVaccines: Vaccine[] = [
  {
    id: "v1",
    name: "Covaxin",
    type: "Inactivated Virus",
    manufacturer: "Bharat Biotech",
    stock: 500,
    capacity: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "v2",
    name: "Covishield",
    type: "Viral Vector",
    manufacturer: "Serum Institute of India",
    stock: 1200,
    capacity: 2000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "v3",
    name: "Sputnik V",
    type: "Viral Vector",
    manufacturer: "Gamaleya Research Institute",
    stock: 300,
    capacity: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "v4",
    name: "Corbevax",
    type: "Protein Subunit",
    manufacturer: "Biological E. Limited",
    stock: 150,
    capacity: 1000,
    lastUpdated: new Date().toISOString(),
  },
];
