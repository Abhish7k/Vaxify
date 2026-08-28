export type HospitalStatusDto = "PENDING" | "APPROVED" | "REJECTED";

export interface VaccineResponseDto {
  id: number | string;
  name: string;
  type: string;
  manufacturer: string;
  stock: number;
  capacity: number;
  hospitalId?: number | string;
  hospitalName?: string;
  lastUpdated?: string;
  price?: number;
}

export interface HospitalResponseDto {
  id: number | string;
  name: string;
  address: string;
  licenseNumber?: string;
  documentUrl?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: HospitalStatusDto;
  staffName?: string;
  staffEmail?: string;
  staffPhone?: string;
  staffCreatedAt?: string;
  availableVaccines?: VaccineResponseDto[];
  availableVaccineNames?: string[];
  workingHours?: string;
}

export interface HospitalSummaryDto {
  id: number | string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  availableVaccineNames?: string[];
  availableVaccines?: VaccineResponseDto[];
  staffEmail?: string;
  staffPhone?: string;
}

export interface UpdateHospitalRequestDto {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  documentUrl?: string;
}

export interface StaffHospitalRegistrationRequestDto {
  staffName: string;
  email: string;
  password: string;
  phone: string;
  hospitalName: string;
  hospitalAddress: string;
  licenseNumber: string;
  document: string;
  city: string;
  state: string;
  pincode: string;
}
