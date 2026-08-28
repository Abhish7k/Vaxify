import type { Hospital, HospitalStatus } from "./hospital";

export type { HospitalStatus };

export type AdminHospital = Hospital;

export const copy: Record<
  HospitalStatus,
  { title: string; description: string }
> = {
  PENDING: {
    title: "No pending hospitals",
    description: "There are no hospital registrations waiting for approval.",
  },
  APPROVED: {
    title: "No approved hospitals",
    description: "No hospitals have been approved yet.",
  },
  REJECTED: {
    title: "No rejected hospitals",
    description: "No hospital registrations have been rejected.",
  },
};
