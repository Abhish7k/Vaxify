import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Action {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

export default function AdminQuickActions() {
  const navigate = useNavigate();

  const actions: Action[] = [
    {
      label: "Review Hospital Approvals",
      description: "Approve or reject pending hospital requests",
      icon: ClipboardCheck,
      onClick: () => {
        navigate("/admin/hospitals");
      },
    },
    {
      label: "Manage Users",
      description: "View and manage registered patients",
      icon: Users,
      onClick: () => {
        navigate("/admin/users");
      },
    },
    {
      label: "Platform Analytics",
      description: "View vaccination insights and trends",
      icon: BarChart3,
      onClick: () => {
        navigate("/admin/analytics");
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto items-start justify-start gap-3 p-4 text-left cursor-pointer active:scale-95 transition-all"
              onClick={action.onClick}
            >
              <div className="mt-1 rounded-md bg-muted p-2">
                <Icon className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
