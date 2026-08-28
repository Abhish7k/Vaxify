import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickActionItems = [
  {
    name: "Book Appointments",
    link: "/centers",
  },
  {
    name: "View Appointments",
    link: "/appointments",
  },
  {
    name: "View Profile",
    link: "/profile",
  },
];

export default function UserDashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        <CardDescription>What would you like to do next?</CardDescription>
      </CardHeader>

      <CardContent className="">
        {QuickActionItems.map((item) => (
          <Link to={item.link} key={item.link}>
            <Button
              variant="outline"
              className="w-full cursor-pointer active:scale-95 transition-all mb-3 text-sm"
            >
              {item.name}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
