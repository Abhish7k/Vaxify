import type { VaccineResponseDto } from "@/api/dto/hospital";
import { asIdString, asString } from "@/api/dto/primitives";
import type { Vaccine } from "@/types/vaccine";

export function mapVaccine(dto: VaccineResponseDto): Vaccine {
  return {
    id: asIdString(dto.id),
    name: dto.name,
    type: dto.type,
    manufacturer: dto.manufacturer,
    stock: dto.stock,
    capacity: dto.capacity,
    lastUpdated: asString(dto.lastUpdated),
    hospitalId: dto.hospitalId != null ? asIdString(dto.hospitalId) : undefined,
    hospitalName: dto.hospitalName,
    price: dto.price,
  };
}
