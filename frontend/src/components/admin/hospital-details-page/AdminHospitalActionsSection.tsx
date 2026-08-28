import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Props = {
  hospitalName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
};

export default function AdminHospitalFloatingActions({
  hospitalName,
  status,
  onApprove,
  onReject,
  isPending = false,
}: Props) {
  if (status !== "PENDING") return null;

  return (
    <div className="fixed bottom-10 right-10 md:bottom-14 md:right-20 z-50">
      <div
        className="
          w-72 rounded-lg border p-4
          bg-background/10 backdrop-blur supports-backdrop-filter:bg-background/60
          shadow-lg
          transition-all duration-200 ease-out
          hover:-translate-y-1 hover:scale-[1.03]
          hover:shadow-xl
          hover:border
        "
      >
        <div className="mb-3">
          <p className="text-sm font-medium">Review hospital</p>
          <p className="text-xs text-muted-foreground">{hospitalName}</p>
        </div>

        <div className="flex gap-2">
          {/* approve */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                disabled={isPending}
                className="flex-1 cursor-pointer active:scale-95 transition-all hover:bg-primary/90"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve hospital?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will approve{" "}
                  <span className="font-medium">{hospitalName}</span> and allow
                  it to manage appointments on the platform.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  disabled={isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    onApprove();
                  }}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* reject */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="flex-1 text-destructive hover:bg-destructive/10 cursor-pointer active:scale-95 transition-all"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject hospital?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.{" "}
                  <span className="font-medium">{hospitalName}</span> will not
                  be allowed to operate on the platform.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Go back</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    onReject();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
