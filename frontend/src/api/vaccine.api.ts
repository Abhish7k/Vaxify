import type { UpdateStockRequest, Vaccine } from "@/types/vaccine";

// todo: replace mock data with actual data
// todo: implement actual api calls

export const vaccineApi = {
  // get all vaccines
  getVaccines: async (): Promise<Vaccine[]> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [...mockVaccines];
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      throw error;
    }
  },

  // add new vaccine
  addVaccine: async (
    vaccine: Omit<Vaccine, "id" | "lastUpdated">,
  ): Promise<Vaccine> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newVaccine: Vaccine = {
        ...vaccine,
        id: `v${mockVaccines.length + 1}`,
        lastUpdated: new Date().toISOString(),
      };
      mockVaccines.push(newVaccine);
      return newVaccine;
    } catch (error) {
      console.error("Error adding vaccine:", error);
      throw error;
    }
  },

  // update stock
  updateStock: async (request: UpdateStockRequest): Promise<Vaccine> => {
    try {
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
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  },

  // delete vaccine
  deleteVaccine: async (id: string): Promise<void> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = mockVaccines.findIndex((v) => v.id === id);
      if (index === -1) {
        throw new Error("Vaccine not found");
      }
      mockVaccines.splice(index, 1);
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      throw error;
    }
  },

  // get low stock alerts
  getLowStockAlerts: async (): Promise<Vaccine[]> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockVaccines.filter((v) => v.stock / v.capacity < 0.5);
    } catch (error) {
      console.error("Error fetching low stock alerts:", error);
      throw error;
    }
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
