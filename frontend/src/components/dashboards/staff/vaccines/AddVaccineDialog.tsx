import { useState, useEffect } from "react";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddVaccineDialogProps {
  onSuccess: () => void;
}

// zod schema
const addVaccineSchema = z
  .object({
    name: z.string().min(1, "Vaccine name is required"),
    type: z.string().min(1, "Vaccine type is required"),
    manufacturer: z.string().min(1, "Manufacturer is required"),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    capacity: z.coerce.number().min(1, "Capacity must be greater than zero"),
  })
  .refine((data) => data.stock <= data.capacity, {
    message: "Stock cannot exceed capacity",
    path: ["stock"], // Shows error on stock field
  });

type AddVaccineFormValues = z.infer<typeof addVaccineSchema>;

export function AddVaccineDialog({ onSuccess }: AddVaccineDialogProps) {
  const [open, setOpen] = useState(false);
  const [isOtherType, setIsOtherType] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddVaccineFormValues>({
    resolver: zodResolver(addVaccineSchema as any),
    defaultValues: {
      name: "",
      type: "Viral Vector",
      manufacturer: "",
      stock: 0,
      capacity: 0,
    },
  });

  const typeValue = watch("type");

  // handle "other" type selection logic
  useEffect(() => {
    const standardTypes = [
      "Inactivated Virus",
      "Viral Vector",
      "mRNA",
      "Protein Subunit",
    ];
    if (typeValue && !standardTypes.includes(typeValue)) {
      setIsOtherType(true);
    } else {
      setIsOtherType(false);
    }
  }, [typeValue]);

  const onSubmit = async (data: AddVaccineFormValues) => {
    try {
      const result = await vaccineApi.addVaccine(data);

      toast.success(`${result.name} added to inventory`, {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });

      setOpen(false);

      reset(); // reset form

      onSuccess();
    } catch (error) {
      toast.error("Failed to add vaccine", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });

      console.error(error);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === "Other") {
      setIsOtherType(true);
      setValue("type", ""); // clear for manual input
    } else {
      setIsOtherType(false);
      setValue("type", value, { shouldValidate: true });
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Vaccine Name</Label>

            <Input
              id="name"
              placeholder="e.g. Covaxin"
              {...register("name")}
              disabled={isSubmitting}
            />

            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Vaccine Type</Label>

            <Select
              disabled={isSubmitting}
              value={isOtherType ? "Other" : typeValue}
              onValueChange={handleSelectChange}
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

                <SelectItem value="Other">Other (Enter manually)</SelectItem>
              </SelectContent>
            </Select>

            {/* show input if custom type is needed */}
            {isOtherType && (
              <Input
                placeholder="Enter Custom Vaccine Type"
                value={typeValue}
                onChange={(e) =>
                  setValue("type", e.target.value, { shouldValidate: true })
                }
                className="mt-2"
              />
            )}

            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>

            <Input
              id="manufacturer"
              placeholder="e.g. Bharat Biotech"
              {...register("manufacturer")}
              disabled={isSubmitting}
            />

            {errors.manufacturer && (
              <p className="text-sm text-destructive">
                {errors.manufacturer.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Initial Stock</Label>

            <Input
              id="stock"
              type="number"
              min="0"
              {...register("stock")}
              disabled={isSubmitting}
            />

            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="capacity">Storage Capacity</Label>

            <Input
              id="capacity"
              type="number"
              min="0"
              placeholder="Total storage limit"
              {...register("capacity")}
              disabled={isSubmitting}
            />

            {errors.capacity && (
              <p className="text-sm text-destructive">
                {errors.capacity.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Vaccine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
