import type { Vaccine } from "./vaccine";
import type { CenterData } from "./center-details";

export type HospitalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Center = {
  id: string;
  name: string;
  address: string;
  availableVaccines?: string[];
  vaccines?: Vaccine[];
  staffEmail?: string;
  staffPhone?: string;
};

export type Hospital = Center & {
  licenseNumber?: string;
  documentUrl?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: HospitalStatus;
  staffName?: string;
  staffCreatedAt?: string;
  workingHours?: string;
};

export type UpdateHospitalRequest = {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  documentUrl?: string;
};

export function toCenterData(hospital: Hospital): CenterData {
  return {
    id: hospital.id,
    name: hospital.name,
    address: hospital.address,
    city: hospital.city,
    state: hospital.state,
    pincode: hospital.pincode,
    phone: hospital.staffPhone,
    email: hospital.staffEmail,
    operatingHours: hospital.workingHours
      ? { weekdays: hospital.workingHours }
      : undefined,
    vaccines: (hospital.vaccines || []).map((vaccine) => ({
      name: vaccine.name,
      available: (vaccine.stock || 0) > 0,
      price: vaccine.price ? `₹${vaccine.price}` : "Free",
    })),
  };
}
