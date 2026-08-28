import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";
import { hospitalApi } from "@/api/hospital.api";
import { queryKeys } from "@/lib/query-keys";
import type { Hospital, UpdateHospitalRequest } from "@/types/hospital";

export function useMyHospital() {
  return useQuery({
    queryKey: queryKeys.hospitals.mine(),
    queryFn: () => hospitalApi.getMyHospital(),
  });
}

export function usePublicHospitals() {
  return useQuery({
    queryKey: queryKeys.hospitals.publicList(),
    queryFn: () => hospitalApi.getAllHospitals(),
  });
}

export function useHospital(hospitalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.hospitals.detail(hospitalId ?? ""),
    queryFn: () => hospitalApi.getHospitalById(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

export function useAdminHospital(hospitalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.hospitals.adminDetail(hospitalId ?? ""),
    queryFn: () => hospitalApi.getAdminHospitalById(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

export function useAdminHospitals() {
  return useQuery({
    queryKey: queryKeys.hospitals.adminList(),
    queryFn: () => hospitalApi.getAdminHospitals(),
  });
}

export function usePendingHospitals() {
  return useQuery({
    queryKey: queryKeys.hospitals.pending(),
    queryFn: () => adminApi.getPendingHospitals(),
  });
}

async function invalidateHospitalAdminCaches(
  client: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.hospitals.adminList() }),
    client.invalidateQueries({ queryKey: queryKeys.hospitals.pending() }),
    client.invalidateQueries({ queryKey: queryKeys.admin.stats() }),
    client.invalidateQueries({ queryKey: queryKeys.hospitals.all }),
  ]);
}

export function useUpdateMyHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateHospitalRequest) => hospitalApi.updateHospital(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.mine() });
    },
  });
}

export function useApproveHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hospitalApi.approveHospital(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Hospital>(queryKeys.hospitals.adminDetail(id), (old) =>
        old ? { ...old, status: "APPROVED" } : old,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.adminDetail(id) });
      void invalidateHospitalAdminCaches(queryClient);
    },
  });
}

export function useRejectHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hospitalApi.rejectHospital(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Hospital>(queryKeys.hospitals.adminDetail(id), (old) =>
        old ? { ...old, status: "REJECTED" } : old,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.adminDetail(id) });
      void invalidateHospitalAdminCaches(queryClient);
    },
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hospitalApi.deleteHospital(id),
    onSuccess: () => {
      void invalidateHospitalAdminCaches(queryClient);
    },
  });
}
