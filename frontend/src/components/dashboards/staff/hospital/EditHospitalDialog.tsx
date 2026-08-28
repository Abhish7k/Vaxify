import { useState } from "react";
import { z } from "zod";
import { Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "@/components/ui/file-dropzone";
import type { UpdateHospitalRequest } from "@/types/hospital";
import type { Dispatch, SetStateAction } from "react";
import { PINCODE_MESSAGE, PINCODE_REGEX } from "@/lib/validation";

const hospitalSchema = z.object({
  name: z.string().min(2, "Hospital name must be between 2 and 100 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(PINCODE_REGEX, PINCODE_MESSAGE),
  documentUrl: z.string().optional(),
});

interface EditHospitalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UpdateHospitalRequest;
  setFormData: Dispatch<SetStateAction<UpdateHospitalRequest>>;
  isUpdating: boolean;
  onUpdate: (e: React.FormEvent) => void;
}

export const EditHospitalDialog = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  isUpdating,
  onUpdate,
}: EditHospitalDialogProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = hospitalSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field !== undefined) {
          formattedErrors[field.toString()] = issue.message;
        }
      });

      setErrors(formattedErrors);

      return;
    }

    setErrors({});

    onUpdate(e);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };

        delete newErrors[field];

        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Hospital Details</DialogTitle>

            <DialogDescription>
              Make changes to your hospital's public information here.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Hospital Name</Label>

              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              />

              {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>

              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-destructive focus-visible:ring-destructive" : ""}
              />

              {errors.address && (
                <p className="text-xs font-medium text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>

                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={errors.city ? "border-destructive focus-visible:ring-destructive" : ""}
                />

                {errors.city && <p className="text-xs font-medium text-destructive">{errors.city}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pincode">Pincode</Label>

                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  className={errors.pincode ? "border-destructive focus-visible:ring-destructive" : ""}
                />

                {errors.pincode && (
                  <p className="text-xs font-medium text-destructive">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>

              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className={errors.state ? "border-destructive focus-visible:ring-destructive" : ""}
              />

              {errors.state && <p className="text-xs font-medium text-destructive">{errors.state}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="verification-document">Verification Document</Label>

              <FileDropzone
                id="verification-document"
                value={formData.documentUrl}
                onChange={(url, fileName) => setFormData({ ...formData, documentUrl: fileName || url })}
              />

              {formData.documentUrl && (
                <p className="text-xs text-muted-foreground truncate">Current: {formData.documentUrl}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={isUpdating} className="gap-2">
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
