import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vaccineApi } from "@/api/vaccine.api";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateStockRequest, Vaccine } from "@/types/vaccine";

export function useMyVaccines() {
  return useQuery({
    queryKey: queryKeys.vaccines.mine(),
    queryFn: () => vaccineApi.getMyVaccines(),
  });
}

export function useHospitalVaccines(hospitalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vaccines.byHospital(hospitalId ?? ""),
    queryFn: () => vaccineApi.getVaccinesByHospitalId(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

function invalidateVaccineCaches(client: ReturnType<typeof useQueryClient>) {
  return client.invalidateQueries({ queryKey: queryKeys.vaccines.all });
}

export function useAddVaccine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vaccine: Omit<Vaccine, "id" | "lastUpdated">) =>
      vaccineApi.addVaccine(vaccine),
    onSuccess: () => {
      void invalidateVaccineCaches(queryClient);
    },
  });
}

export function useUpdateVaccineStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateStockRequest) => vaccineApi.updateStock(request),
    onSuccess: () => {
      void invalidateVaccineCaches(queryClient);
    },
  });
}

export function useDeleteVaccine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vaccineApi.deleteVaccine(id),
    onSuccess: () => {
      void invalidateVaccineCaches(queryClient);
    },
  });
}
