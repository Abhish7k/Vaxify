import { LoaderCircle } from "lucide-react";

export function RouteSpinner() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin text-primary/80" />
    </div>
  );
}
