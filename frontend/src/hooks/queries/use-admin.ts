import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";
import { queryKeys } from "@/lib/query-keys";

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => adminApi.getStats(),
  });
}

export function useAdminActivities() {
  return useQuery({
    queryKey: queryKeys.admin.activities(),
    queryFn: () => adminApi.getActivities(),
  });
}
