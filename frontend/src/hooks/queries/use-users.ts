import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";
import { queryKeys } from "@/lib/query-keys";

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: () => userApi.getProfile(),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: () => userApi.getStats(),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.users.adminList(),
    queryFn: () => userApi.getAllUsers(),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.adminList() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}
