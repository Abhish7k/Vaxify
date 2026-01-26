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
  patientName: string;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  onMarkCompleted: () => void;
  onCancel: () => void;
};

export default function StaffAppointmentCardActions({
  patientName,
  status,
  onMarkCompleted,
  onCancel,
}: Props) {
  if (status !== "UPCOMING") return null;

  return (
    <div className="flex justify-end gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            className="cursor-pointer active:scale-95 transition-all"
          >
            <Check className="h-4 w-4 mr-1" />
            Complete
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark appointment as completed?</AlertDialogTitle>

            <AlertDialogDescription>
              This confirms that{" "}
              <span className="font-medium">{patientName}</span> has received
              the vaccine.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer active:scale-95 transition-all">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="cursor-pointer active:scale-95 transition-all"
              onClick={onMarkCompleted}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive/10 cursor-pointer active:scale-95 transition-all"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The patient will be notified about
              the cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer active:scale-95 transition-all">
              Go back
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer active:scale-95 transition-all"
            >
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
