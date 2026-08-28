import type {
  HospitalResponseDto,
  HospitalSummaryDto,
  HospitalStatusDto,
} from "@/api/dto/hospital";
import { asIdString } from "@/api/dto/primitives";
import type { Center, Hospital, HospitalStatus } from "@/types/hospital";
import { mapVaccine } from "./vaccine";

function toHospitalStatus(raw: HospitalStatusDto | string | undefined): HospitalStatus {
  if (raw === "APPROVED" || raw === "REJECTED") return raw;
  return "PENDING";
}

function vaccineNames(dto: {
  availableVaccineNames?: string[];
  availableVaccines?: { name: string }[];
}) {
  if (dto.availableVaccineNames?.length) return dto.availableVaccineNames;
  return (dto.availableVaccines || []).map((vaccine) => vaccine.name);
}

export function mapHospitalSummary(dto: HospitalSummaryDto): Center {
  return {
    id: asIdString(dto.id),
    name: dto.name,
    address: dto.address,
    availableVaccines: vaccineNames(dto),
    staffEmail: dto.staffEmail,
    staffPhone: dto.staffPhone,
  };
}

export function mapHospital(dto: HospitalResponseDto): Hospital {
  const vaccines = (dto.availableVaccines || []).map(mapVaccine);

  return {
    id: asIdString(dto.id),
    name: dto.name,
    address: dto.address,
    availableVaccines: vaccineNames(dto),
    vaccines,
    staffEmail: dto.staffEmail,
    staffPhone: dto.staffPhone,
    licenseNumber: dto.licenseNumber,
    documentUrl: dto.documentUrl,
    city: dto.city,
    state: dto.state,
    pincode: dto.pincode,
    status: toHospitalStatus(dto.status),
    staffName: dto.staffName,
    staffCreatedAt: dto.staffCreatedAt,
    workingHours: dto.workingHours,
  };
}
