import { useState } from "react";
import { vaccineApi } from "@/api/vaccine.api";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteVaccineDialogProps {
  vaccine: Vaccine | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteVaccineDialog({
  vaccine,
  onClose,
  onSuccess,
}: DeleteVaccineDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!vaccine) return;

    setDeleting(true);
    try {
      await vaccineApi.deleteVaccine(vaccine.id);

      toast.success("Vaccine deleted successfully", {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });

      onSuccess();

      onClose();
    } catch (error) {
      console.error("Delete failed", error);

      toast.error("Failed to delete vaccine", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });
    } finally {
      setDeleting(false);
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
