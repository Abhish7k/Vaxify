import { useState, useEffect } from "react";
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

interface UpdateStockDialogProps {
  vaccine: Vaccine | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateStockDialog({
  vaccine,
  onClose,
  onSuccess,
}: UpdateStockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (vaccine) {
      setStock(vaccine.stock);
    }
  }, [vaccine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vaccine) return;

    if (stock < 0) {
      toast.error("Stock details cannot be negative", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });

      return;
    }

    setLoading(true);
    try {
      await vaccineApi.updateStock({
        vaccineId: vaccine.id,
        quantity: stock,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!vaccine} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Vaccine Stock</DialogTitle>
          <DialogDescription>
            Update the current stock quantity for {vaccine?.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stock">Current Stock</Label>

            <Input
              id="stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              disabled={loading}
              autoFocus
            />

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
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {loading ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
