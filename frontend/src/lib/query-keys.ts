export const queryKeys = {
  hospitals: {
    all: ["hospitals"] as const,
    publicList: () => [...queryKeys.hospitals.all, "public"] as const,
    adminList: () => [...queryKeys.hospitals.all, "admin"] as const,
    pending: () => [...queryKeys.hospitals.all, "pending"] as const,
    detail: (id: string) => [...queryKeys.hospitals.all, "detail", id] as const,
    adminDetail: (id: string) => [...queryKeys.hospitals.all, "admin-detail", id] as const,
    mine: () => [...queryKeys.hospitals.all, "mine"] as const,
  },
  vaccines: {
    all: ["vaccines"] as const,
    mine: () => [...queryKeys.vaccines.all, "mine"] as const,
    byHospital: (hospitalId: string) =>
      [...queryKeys.vaccines.all, "hospital", hospitalId] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    mine: () => [...queryKeys.appointments.all, "mine"] as const,
    staff: (hospitalId: string) =>
      [...queryKeys.appointments.all, "staff", hospitalId] as const,
  },
  slots: {
    all: ["slots"] as const,
    hospital: (hospitalId: string) =>
      [...queryKeys.slots.all, "hospital", hospitalId] as const,
    booking: (hospitalId: string) =>
      [...queryKeys.slots.all, "booking", hospitalId] as const,
  },
  users: {
    all: ["users"] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
    stats: () => [...queryKeys.users.all, "stats"] as const,
    adminList: () => [...queryKeys.users.all, "admin"] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    activities: () => [...queryKeys.admin.all, "activities"] as const,
  },
};
