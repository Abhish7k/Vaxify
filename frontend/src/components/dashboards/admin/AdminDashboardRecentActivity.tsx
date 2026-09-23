import { CheckCircle, XCircle, Building2, UserPlus, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AdminActivity } from "@/types/admin";

export default function AdminDashboardRecentActivity({
  activities,
}: {
  activities: AdminActivity[];
}) {
  const getIcon = (item: AdminActivity) => {
    if (item.type === "USER")
      return { icon: UserPlus, color: "text-indigo-600" };
    if (item.status === "APPROVED")
      return { icon: CheckCircle, color: "text-green-600" };
    if (item.status === "REJECTED")
      return { icon: XCircle, color: "text-red-600" };
    return { icon: Building2, color: "text-blue-600" };
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="col-span-12 lg:col-span-4 h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {activities.length > 0 ? (
          activities.slice(0, 5).map((item) => {
            const { icon: Icon, color } = getIcon(item);

            return (
              <div key={item.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-slate-50">
                    <Icon className={`h-4 w-4 ${color}`} />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.action}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {item.target}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {formatTime(item.timestamp)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
