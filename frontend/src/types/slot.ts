export type SlotStatus = "AVAILABLE" | "FULL" | "CANCELLED";

export interface Slot {
  id: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  startTime: string;
  endTime: string;
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
  status?: SlotStatus;
}

export interface BulkSlotResult {
  created: number;
  skipped: number;
  createdSlots: Slot[];
}
