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
};

export default function AdminHospitalCardActions({
  hospitalName,
  status,
  onApprove,
  onReject,
}: Props) {
  if (status !== "PENDING") return null;

  return (
    <div className="flex justify-end gap-2 pt-2">
      {/* approve */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            className="cursor-pointer active:scale-95 transition-all"
          >
            <Check className="h-4 w-4 mr-0.5" />
            Approve
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve hospital?</AlertDialogTitle>

            <AlertDialogDescription>
              This will approve{" "}
              <span className="font-medium">{hospitalName}</span> and allow it
              to manage appointments on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer active:scale-95 transition-all">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="cursor-pointer active:scale-95 transition-all"
              onClick={onApprove}
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
            className="text-destructive hover:bg-destructive/10 cursor-pointer active:scale-95 transition-all"
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
              <span className="font-medium">{hospitalName}</span> will not be
              allowed to operate on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer active:scale-95 transition-all">
              Go back
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer active:scale-95 transition-all"
            >
              Yes, reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
