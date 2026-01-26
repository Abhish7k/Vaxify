import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  centerName: string;
  onConfirm: () => void;
};

export default function CancelAppointmentDialog({
  centerName,
  onConfirm,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive cursor-pointer active:scale-95 transition-all"
        >
          Cancel
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader className="mb-4 items-center gap-2 md:flex-row md:items-start md:gap-4">
          <div
            aria-hidden="true"
            className="shrink-0 rounded-full bg-destructive/10 p-3"
          >
            <Trash2 className="size-5 text-destructive" />
          </div>

          <div className="flex flex-col gap-2">
            <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your vaccination appointment at{" "}
              <span className="font-medium">{centerName}</span> ? This action
              cannot be undone.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer active:scale-95 transition-all">
            Keep appointment
          </AlertDialogCancel>

          <AlertDialogAction
            className={buttonVariants({
              variant: "destructive",
              className:
                "bg-destructive/90 hover:bg-destructive/80 cursor-pointer active:scale-95 transition-all",
            })}
            onClick={onConfirm}
          >
            Yes, cancel appointment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
