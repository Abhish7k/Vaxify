import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut } from "lucide-react";
import Avvvatars from "avvvatars-react";
import { useAuth } from "@/auth/useAuth";
import { USER_NAV_DROPDOWN_ITEMS } from "@/constants/user-nav-dropdown";

const UserNav = () => {
  const { user, logout } = useAuth();

  const userRole = user?.role;

  const items = USER_NAV_DROPDOWN_ITEMS[userRole!];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Avatar>
            <AvatarImage src={""} />

            <AvatarFallback>
              <Avvvatars value={user?.email || "user"} style="character" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end" className="min-w-52">
          <DropdownMenuLabel className="pl-2 pr-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium leading-none capitalize">
                {/* {user?.name} */}
                Full Name
              </p>

              <p className="text-xs leading-none text-muted-foreground max-w-40 truncate">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {items.map((item, idx) => (
            <Link to={item.href} key={idx} className="">
              <DropdownMenuItem className="flex gap-2 items-center hover:bg-gray-100 transition-all w-full cursor-pointer">
                <item.icon className="size-4" />

                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex gap-2 items-center hover:bg-gray-100 transition-all w-full cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserNav;
