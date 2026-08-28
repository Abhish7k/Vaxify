import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slotsApi, type CreateSlotRequest, type Slot } from "@/api/slots.api";
import { queryKeys } from "@/lib/query-keys";

function sortSlots(data: Slot[]) {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.date + "T" + a.startTime);
    const dateB = new Date(b.date + "T" + b.startTime);
    return dateA.getTime() - dateB.getTime();
  });
}

export function useHospitalSlots(hospitalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.slots.hospital(hospitalId ?? ""),
    queryFn: () => slotsApi.getSlotsByHospital(hospitalId!),
    enabled: Boolean(hospitalId),
    select: sortSlots,
  });
}

function invalidateSlotCaches(client: ReturnType<typeof useQueryClient>) {
  return client.invalidateQueries({ queryKey: queryKeys.slots.all });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSlotRequest) => slotsApi.createSlot(data),
    onSuccess: () => {
      void invalidateSlotCaches(queryClient);
    },
  });
}

export function useBulkCreateSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slots: CreateSlotRequest[]) => slotsApi.bulkCreateSlots(slots),
    onSuccess: () => {
      void invalidateSlotCaches(queryClient);
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: string) => slotsApi.deleteSlot(slotId),
    onSuccess: () => {
      void invalidateSlotCaches(queryClient);
    },
  });
}
