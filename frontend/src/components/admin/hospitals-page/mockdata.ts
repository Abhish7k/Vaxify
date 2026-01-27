import type { AdminHospital } from "./types";

export const mockHospitals: AdminHospital[] = [
  {
    id: "hosp-1",
    name: "City Health Hospital",
    address: "MG Road, Pune",
    staffName: "Ramesh Kumar",
    staffEmail: "ramesh@cityhealth.com",
    status: "PENDING",
  },
  {
    id: "hosp-2",
    name: "Apollo Care Center",
    address: "Indiranagar, Pune",
    staffName: "Anita Verma",
    staffEmail: "anita@apollo.com",
    status: "APPROVED",
  },
  {
    id: "hosp-3",
    name: "Green Life Hospital",
    address: "Kothrud, Pune",
    staffName: "Kunal Mehta",
    staffEmail: "kunal@greenlife.com",
    status: "APPROVED",
  },
];
