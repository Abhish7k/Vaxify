import { Outlet } from "react-router-dom";
import DocumentTitle from "@/components/DocumentTitle";

export default function AuthLayout() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <DocumentTitle />
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
