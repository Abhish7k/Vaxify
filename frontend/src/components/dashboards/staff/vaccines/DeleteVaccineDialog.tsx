import type { Vaccine } from "@/types/vaccine";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toastUtils } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { useDeleteVaccine } from "@/hooks/queries/use-vaccines";

interface DeleteVaccineDialogProps {
  vaccine: Vaccine | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteVaccineDialog({
  vaccine,
  onClose,
  onSuccess,
}: DeleteVaccineDialogProps) {
  const deleteVaccine = useDeleteVaccine();
  const deleting = deleteVaccine.isPending;

  const handleDelete = async () => {
    if (!vaccine) return;

    try {
      await deleteVaccine.mutateAsync(vaccine.id);

      toastUtils.success("Vaccine deleted successfully");

      onSuccess?.();

      onClose();
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to delete vaccine"));
    }
  };

  return (
    <AlertDialog open={!!vaccine} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">
              {vaccine?.name}
            </span>{" "}
            from the inventory. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Entry
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
