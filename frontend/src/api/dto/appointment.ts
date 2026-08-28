export interface AppointmentResponseDto {
  id: number | string;
  userId?: number | string;
  centerId?: number | string;
  hospitalId?: number | string;
  centerName?: string;
  centerAddress?: string;
  vaccineId?: number | string;
  vaccineName?: string;
  date: string;
  slot?: string;
  endTime?: string;
  status: string;
  createdAt?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
}

export interface BookAppointmentRequestDto {
  centerId: string;
  vaccineId: string;
  date: string;
  slot: string;
}
