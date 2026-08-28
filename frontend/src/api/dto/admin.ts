export interface AdminStatsDto {
  totalHospitals: number;
  pendingApprovals: number;
  totalUsers: number;
  activeCenters: number;
  totalAppointments: number;
}

export interface AdminActivityDto {
  id: string;
  action: string;
  target: string;
  type: string;
  status?: string;
  timestamp: string;
}
