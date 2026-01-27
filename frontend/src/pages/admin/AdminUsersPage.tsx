import AdminUsersTable from "@/components/admin/users-page/UsersTable";

const AdminUsersPage = () => {
  return (
    <div className="px-5 py-5 md:px-10 transition-all">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          View all registered users on the platform
        </p>
      </div>

      {/* users data table */}
      <AdminUsersTable />
    </div>
  );
};

export default AdminUsersPage;
