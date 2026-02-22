import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { userApi, type UserProfile } from "@/api/user.api";
import { toastUtils } from "@/lib/toast";
import { cn } from "@/lib/utils";
import AdminUsersTable from "@/components/admin/users-page/UsersTable";
import { AdminUsersTableSkeleton } from "@/components/skeletons/AdminUsersTableSkeleton";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await userApi.getAllUsers();

      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);

      toastUtils.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);

      const data = await userApi.getAllUsers();

      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);

      toastUtils.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (user: UserProfile) => {
    try {
      await userApi.deleteUser(user.id);

      toastUtils.success("User deleted successfully");

      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);

      toastUtils.error("Failed to delete user");
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-5 py-5 md:px-10 space-y-8"
    >
      {/* header */}
      <motion.div
        variants={item}
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
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2 text-xs sm:text-sm transition-all min-w-[120px]"
        >
          <RotateCcw className={cn("size-3.5 sm:size-4", loading && "animate-spin")} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </motion.div>

      {/* users data table */}
      <motion.div variants={item} className="w-full">
        {loading ? (
          <AdminUsersTableSkeleton />
        ) : (
          <AdminUsersTable users={users} onDelete={handleDeleteUser} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminUsersPage;
