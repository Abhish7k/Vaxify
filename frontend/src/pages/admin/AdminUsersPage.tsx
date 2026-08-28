import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastUtils } from "@/lib/toast";
import { fadeUpItemSlow, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import AdminUsersTable from "@/components/admin/users-page/UsersTable";
import { AdminUsersTableSkeleton } from "@/components/skeletons/AdminUsersTableSkeleton";
import { useAdminUsers, useDeleteUser } from "@/hooks/queries/use-users";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { getErrorMessage } from "@/lib/errors";
import { PageLoadError } from "@/components/ui/page-load-error";
import type { UserProfile } from "@/api/user.api";

const AdminUsersPage = () => {
  const usersQuery = useAdminUsers();
  const deleteUser = useDeleteUser();
  const users = usersQuery.data ?? [];
  const loading = usersQuery.isFetching;

  useQueryErrorToast(
    usersQuery.isError,
    "Failed to load users",
    usersQuery.error,
  );

  const handleDeleteUser = async (user: UserProfile) => {
    try {
      await deleteUser.mutateAsync(user.id);

      toastUtils.success("User deleted successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to delete user"));
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="px-5 py-5 md:px-10 space-y-8"
    >
      {/* header */}
      <motion.div
        variants={fadeUpItemSlow}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and view all registered users across the platform
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void usersQuery.refetch()}
          disabled={loading}
          className="gap-2 text-xs sm:text-sm transition-all min-w-[120px]"
        >
          <RotateCcw className={cn("size-3.5 sm:size-4", loading && "animate-spin")} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </motion.div>

      {/* users data table */}
      <motion.div variants={fadeUpItemSlow} className="w-full">
        {loading ? (
          <AdminUsersTableSkeleton />
        ) : usersQuery.isError ? (
          <PageLoadError
            message="Could not load users. Please try again."
            onRetry={() => void usersQuery.refetch()}
          />
        ) : (
          <AdminUsersTable users={users} onDelete={handleDeleteUser} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminUsersPage;
