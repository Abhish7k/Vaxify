import { useEffect, useMemo } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toastUtils } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useUpdateVaccineStock } from "@/hooks/queries/use-vaccines";

interface UpdateStockDialogProps {
  vaccine: Vaccine | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// base schema
const baseSchema = z.object({
  stock: z.number().int("Stock must be a whole number (no decimals)").min(0, "Stock must be a whole number (no decimals)"),
});

type UpdateStockFormValues = z.infer<typeof baseSchema>;

export function UpdateStockDialog({ vaccine, onClose, onSuccess }: UpdateStockDialogProps) {
  const updateStock = useUpdateVaccineStock();
  // refine based on vaccine capacity
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
    resolver: zodResolver(updateStockSchema),
    defaultValues: { stock: 0 },
  });

  // update default when vaccine changes
  useEffect(() => {
    if (vaccine) {
      reset({ stock: vaccine.stock });
    }
  }, [vaccine, reset]);

  const onSubmit = async (data: UpdateStockFormValues) => {
    if (!vaccine) return;

    try {
      await updateStock.mutateAsync({
        vaccineId: vaccine.id,
        quantity: data.stock,
      });

      toastUtils.success(`Stock updated for ${vaccine.name}`);

      onSuccess?.();

      onClose();
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to update stock"));
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
          <DialogDescription>Update the current stock quantity for {vaccine?.name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stock">Current Stock</Label>

            <Input
              id="stock"
              type="number"
              min="0"
              {...register("stock", { valueAsNumber: true })}
              disabled={isSubmitting}
            />

            {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}

            {vaccine && (
              <p className="text-xs text-muted-foreground">
                Capacity: {vaccine.capacity} | Previous: {vaccine.stock}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
