export type SlotStatusDto = "AVAILABLE" | "FULL" | "CANCELLED";

export interface SlotResponseDto {
  id: number | string;
  hospitalId: number | string;
  hospitalName: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: SlotStatusDto;
  createdAt?: string;
}

export interface SlotRequestDto {
  hospitalId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status?: SlotStatusDto;
}

export interface BulkSlotResponseDto {
  created: number;
  skipped: number;
  createdSlots: SlotResponseDto[];
}
