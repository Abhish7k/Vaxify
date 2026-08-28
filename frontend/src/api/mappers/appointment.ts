import type { AppointmentResponseDto } from "@/api/dto/appointment";
import { asIdString, asString } from "@/api/dto/primitives";
import type { Appointment } from "@/types/appointment";
import { toAppointmentStatus } from "@/types/appointment";

export function mapAppointment(
  dto: AppointmentResponseDto,
  audience: "user" | "staff" = "user",
): Appointment {
  const vaccineName = asString(dto.vaccineName, "Unknown Vaccine");
  const slot = asString(dto.slot || undefined, "N/A");

  return {
    id: asIdString(dto.id),
    userId: dto.userId != null ? asIdString(dto.userId) : undefined,
    centerId: asIdString(dto.hospitalId ?? dto.centerId),
    vaccineId: dto.vaccineId != null ? asIdString(dto.vaccineId) : undefined,
    date: dto.date,
    slot,
    endTime: dto.endTime,
    status: toAppointmentStatus(dto.status, audience),
    createdAt: dto.createdAt,
    centerName: asString(dto.centerName, "Unknown Center"),
    centerAddress: asString(dto.centerAddress),
    vaccineName,
    vaccine: vaccineName,
    timeSlot: slot,
    patientName: dto.patientName,
    patientPhone: dto.patientPhone,
    patientEmail: dto.patientEmail,
  };
}

export function mapUserAppointment(dto: AppointmentResponseDto): Appointment {
  return mapAppointment(dto, "user");
}

export function mapStaffAppointment(dto: AppointmentResponseDto): Appointment {
  return mapAppointment(dto, "staff");
}
