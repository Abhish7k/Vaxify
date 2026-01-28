import { useState } from "react";
import { vaccineApi } from "@/api/vaccine.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddVaccineDialogProps {
  onSuccess: () => void;
}

export function AddVaccineDialog({ onSuccess }: AddVaccineDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newVaccine, setNewVaccine] = useState({
    name: "",
    type: "Viral Vector",
    manufacturer: "",
    stock: 0,
    capacity: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVaccine.name || !newVaccine.manufacturer) {
      toast.error("Please fill in all fields");

      return;
    }

    setLoading(true);
    try {
      const result = await vaccineApi.addVaccine(newVaccine);

      toast.success(`${result.name} added to inventory`, {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });

      setOpen(false);

      setNewVaccine({
        name: "",
        type: "Viral Vector",
        manufacturer: "",
        stock: 0,
        capacity: 0,
      });

      onSuccess();
    } catch (error) {
      toast.error("Failed to add vaccine", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Vaccine
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vaccine</DialogTitle>
          <DialogDescription>
            Enter the details for the new vaccine to add to inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Vaccine Name</Label>
            <Input
              id="name"
              placeholder="e.g. Covaxin"
              value={newVaccine.name}
              onChange={(e) =>
                setNewVaccine({ ...newVaccine, name: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Vaccine Type</Label>
            <Select
              disabled={loading}
              value={newVaccine.type}
              onValueChange={(value) =>
                setNewVaccine({ ...newVaccine, type: value })
              }
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Inactivated Virus">
                  Inactivated Virus
                </SelectItem>
                <SelectItem value="Viral Vector">Viral Vector</SelectItem>
                <SelectItem value="mRNA">mRNA</SelectItem>
                <SelectItem value="Protein Subunit">Protein Subunit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              placeholder="e.g. Bharat Biotech"
              value={newVaccine.manufacturer}
              onChange={(e) =>
                setNewVaccine({ ...newVaccine, manufacturer: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Initial Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={newVaccine.stock}
              onChange={(e) =>
                setNewVaccine({
                  ...newVaccine,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity">Storage Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              placeholder="Total storage limit"
              value={newVaccine.capacity}
              onChange={(e) =>
                setNewVaccine({
                  ...newVaccine,
                  capacity: parseInt(e.target.value) || 0,
                })
              }
              disabled={loading}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Vaccine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
