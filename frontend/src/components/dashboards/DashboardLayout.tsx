import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import DocumentTitle from "@/components/DocumentTitle";
import AppSidebar from "./sidebar/AppSidebar";
import UserNav from "../navbar/UserNav";
import { RouteSpinner } from "@/components/ui/route-spinner";
import { Separator } from "../ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DocumentTitle />
      <AppSidebar />

      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex items-center gap-5 font-medium">
              <SidebarTrigger className="cursor-pointer" />

              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
            </div>

            <div>
              <UserNav />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Suspense fallback={<RouteSpinner />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
