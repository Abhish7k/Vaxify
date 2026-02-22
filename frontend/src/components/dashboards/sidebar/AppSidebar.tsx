import { useAuth } from "@/auth/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { DashboardRoleBasedNavigationLinks } from "@/constants/dashboard-navigation";
import { Link } from "react-router-dom";
import MainNavMenu from "./MainNavMenu";

const AppSidebar = () => {
  const { user } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  const userRole = user?.role;

  const menuItems = DashboardRoleBasedNavigationLinks[userRole!];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              onClick={() => {
                if (isMobile) setOpenMobile(false);
              }}
            >
              <Link to="/">
                <div className="">
                  <img src="/logo.svg" alt="" width={30} className="ml-1" />
                </div>

                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="truncate font-semibold">Vaxify</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <MainNavMenu groups={menuItems} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
