import api from "./axios";

export type SlotStatus = "AVAILABLE" | "FULL" | "CANCELLED";

export interface Slot {
  id: string;
  hospitalId: string;
  hospitalName: string;
  date: string; // yyyy-mm-dd
  startTime: string; // hh:mm:ss
  endTime: string; // hh:mm:ss
  capacity: number;
  bookedCount: number;
  status: SlotStatus;
}

export interface CreateSlotRequest {
  hospitalId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: SlotStatus;
}

export const slotsApi = {
  // get slots by hospital
  getSlotsByHospital: async (hospitalId: string): Promise<Slot[]> => {
    const response = await api.get<any[]>(`/slots/hospital/${hospitalId}`);

    return response.data.map((s) => ({
      ...s,
      id: String(s.id),
      hospitalId: String(s.hospitalId),
    }));
  },

  // create new slot
  createSlot: async (data: CreateSlotRequest): Promise<Slot> => {
    const response = await api.post<any>("/slots/staff", data);

    const s = response.data;

    return {
      ...s,
      id: String(s.id),
      hospitalId: String(s.hospitalId),
    };
  },

  // delete slot
  deleteSlot: async (slotId: string): Promise<void> => {
    await api.delete(`/slots/staff/${slotId}`);
  },
};
