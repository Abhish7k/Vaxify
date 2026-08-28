import api from "./axios";
import type { BulkSlotResponseDto, SlotRequestDto, SlotResponseDto } from "@/api/dto/slot";
import { mapSlot } from "@/api/mappers/slot";
import type { BulkSlotResult, CreateSlotRequest, Slot } from "@/types/slot";

export type { Slot, CreateSlotRequest, SlotStatus, BulkSlotResult } from "@/types/slot";

function toSlotRequestDto(data: CreateSlotRequest): SlotRequestDto {
  return {
    hospitalId: data.hospitalId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    capacity: data.capacity,
  };
}

export const slotsApi = {
  getSlotsByHospital: async (hospitalId: string): Promise<Slot[]> => {
    const response = await api.get<SlotResponseDto[]>(`/slots/hospital/${hospitalId}`);
    return response.data.map(mapSlot);
  },

  createSlot: async (data: CreateSlotRequest): Promise<Slot> => {
    const response = await api.post<SlotResponseDto>(
      "/slots/staff",
      toSlotRequestDto(data),
    );
    return mapSlot(response.data);
  },

  bulkCreateSlots: async (slots: CreateSlotRequest[]): Promise<BulkSlotResult> => {
    const response = await api.post<BulkSlotResponseDto>("/slots/staff/bulk", {
      slots: slots.map(toSlotRequestDto),
    });
    return {
      created: response.data.created,
      skipped: response.data.skipped,
      createdSlots: (response.data.createdSlots ?? []).map(mapSlot),
    };
  },

  deleteSlot: async (slotId: string): Promise<void> => {
    await api.delete(`/slots/staff/${slotId}`);
  },
};
