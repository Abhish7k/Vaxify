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
import { NavLink, useLocation } from "react-router-dom";

type MainNavMenuProps = {
  groups: readonly SidebarNavGroup[];
};

function isPathActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

const MainNavMenu = ({ groups }: MainNavMenuProps) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();

  return (
    <>
      {groups?.map((group, groupIdx) => (
        <SidebarGroup key={groupIdx}>
          {group.group && <SidebarGroupLabel>{group.group}</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              {group.items?.map((item, itemIdx) => {
                const active = isPathActive(pathname, item.path);

                return (
                  <SidebarMenuItem key={itemIdx}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="h-9 px-3 font-medium text-foreground/80 data-[active=true]:bg-foreground/10 data-[active=true]:font-medium data-[active=true]:text-foreground data-[active=true]:shadow-[inset_0_0_0_1px_var(--border)]"
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <NavLink
                        to={item.path}
                        aria-current={active ? "page" : undefined}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
};

export default MainNavMenu;
