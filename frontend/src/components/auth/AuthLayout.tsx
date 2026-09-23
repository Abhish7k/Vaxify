import { Link, Outlet } from "react-router-dom";
import DocumentTitle from "@/components/DocumentTitle";

export default function AuthLayout() {
  return (
    <div className="min-h-[90vh] flex flex-col p-4">
      <DocumentTitle />
      <Link
        to="/"
        className="flex items-center gap-2 text-xl min-[600px]:text-2xl font-bold text-indigo-600 w-fit"
      >
        <img src="/logo.svg" alt="" aria-hidden="true" className="w-8 h-8" />
        Vaxify
      </Link>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
