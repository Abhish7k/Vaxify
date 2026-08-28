import type { SlotResponseDto } from "@/api/dto/slot";
import { asIdString } from "@/api/dto/primitives";
import type { HospitalTimeSlot } from "@/types/appointment";
import type { Slot } from "@/types/slot";

export function mapSlot(dto: SlotResponseDto): Slot {
  return {
    id: asIdString(dto.id),
    hospitalId: asIdString(dto.hospitalId),
    hospitalName: dto.hospitalName,
    date: dto.date,
    startTime: dto.startTime,
    endTime: dto.endTime,
    capacity: dto.capacity,
    bookedCount: dto.bookedCount,
    status: dto.status,
  };
}

export function mapBookingSlot(dto: SlotResponseDto): HospitalTimeSlot {
  return {
    time: dto.startTime,
    date: dto.date,
    available: dto.status === "AVAILABLE" && dto.bookedCount < dto.capacity,
  };
}
