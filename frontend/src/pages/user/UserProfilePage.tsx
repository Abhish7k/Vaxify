import UserInfoCard from "@/components/dashboards/user/UserInfoCard";

export default function UserProfilePage() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <UserInfoCard />
      </div>
    </div>
  );
}
