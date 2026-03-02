import UserInfoCard from "@/components/dashboards/user/UserInfoCard";

export default function UserProfilePage() {
  return (
    <div className="flex justify-center px-0 sm:px-4 pt-10 sm:pt-0">
      <div className="w-full max-w-3xl space-y-6">
        <UserInfoCard />
      </div>
    </div>
  );
}
