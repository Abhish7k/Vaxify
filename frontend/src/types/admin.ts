export type AdminActivityType = "USER" | "HOSPITAL";

export interface AdminActivity {
  id: string;
  action: string;
  target: string;
  type: AdminActivityType;
  status?: string;
  timestamp: string;
}

export interface AdminStats {
  totalHospitals: number;
  pendingApprovals: number;
  totalUsers: number;
  activeCenters: number;
  totalAppointments: number;
}
