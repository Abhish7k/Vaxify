import { useEffect, useMemo } from "react";
import { vaccineApi } from "@/api/vaccine.api";
import type { Vaccine } from "@/types/vaccine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface UpdateStockDialogProps {
  vaccine: Vaccine | null;
  onClose: () => void;
  onSuccess: () => void;
}

// static base schema
const baseSchema = z.object({
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
});

type UpdateStockFormValues = z.infer<typeof baseSchema>;

export function UpdateStockDialog({
  vaccine,
  onClose,
  onSuccess,
}: UpdateStockDialogProps) {
  // dynamic refinement based on vaccine capacity
  const updateStockSchema = useMemo(() => {
    return baseSchema.refine((data) => data.stock <= (vaccine?.capacity || 0), {
      message: `Stock cannot exceed capacity (${vaccine?.capacity ?? 0})`,
      path: ["stock"],
    });
  }, [vaccine]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStockFormValues>({
    resolver: zodResolver(updateStockSchema as any),
    defaultValues: { stock: 0 },
  });

  // update form default value when vaccine changes
  useEffect(() => {
    if (vaccine) {
      reset({ stock: vaccine.stock });
    }
  }, [vaccine, reset]);

  const onSubmit = async (data: UpdateStockFormValues) => {
    if (!vaccine) return;

    try {
      await vaccineApi.updateStock({
        vaccineId: vaccine.id,
        quantity: data.stock,
      });

      toast.success(`Stock updated for ${vaccine.name}`, {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });

      onSuccess();

      onClose();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update stock", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={!!vaccine} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Vaccine Stock</DialogTitle>
          <DialogDescription>
            Update the current stock quantity for {vaccine?.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stock">Current Stock</Label>

            <Input
              id="stock"
              type="number"
              min="0"
              {...register("stock")}
              disabled={isSubmitting}
              autoFocus
            />

            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock.message}</p>
            )}

            {vaccine && (
              <p className="text-xs text-muted-foreground">
                Capacity: {vaccine.capacity} | Previous: {vaccine.stock}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
