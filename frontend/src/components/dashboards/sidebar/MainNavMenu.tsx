import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { SidebarNavGroup } from "@/types/sidebar";
import { NavLink } from "react-router-dom";

type MainNavMenuProps = {
  groups: readonly SidebarNavGroup[];
};

const MainNavMenu = ({ groups }: MainNavMenuProps) => {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {groups?.map((group, groupIdx) => (
        <SidebarGroup key={groupIdx}>
          {group.group && <SidebarGroupLabel>{group.group}</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              {group.items?.map((item, itemIdx) => (
                <SidebarMenuItem key={itemIdx}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <NavLink to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
};

export default MainNavMenu;
