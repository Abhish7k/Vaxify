import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HospitalDetailsStepProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const HospitalDetailsStep = ({
  register,
  errors,
}: HospitalDetailsStepProps) => {
  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <Label>Hospital Name</Label>
        <Input {...register("hospitalName")} />
        {errors.hospitalName && (
          <p className="text-sm text-red-500">
            {errors.hospitalName.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Hospital Address</Label>
        <Input {...register("hospitalAddress")} />
        {errors.hospitalAddress && (
          <p className="text-sm text-red-500">
            {errors.hospitalAddress.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Hospital Registration ID</Label>
        <Input {...register("hospitalRegistrationId")} />
        {errors.hospitalRegistrationId && (
          <p className="text-sm text-red-500">
            {errors.hospitalRegistrationId.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Verification Document</Label>
        <Input
          type="file"
          accept=".pdf,.jpg,.png"
          className="cursor-pointer"
          {...register("document")}
        />
        {errors.document && (
          <p className="text-sm text-red-500">
            {errors.document.message as string}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Upload hospital registration proof or authorization letter
        </p>
      </div>

      {/* approval note */}
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-700">
          <strong>Note:</strong> Your account will remain in an approval phase
          until verified by the system administrator.
        </p>
      </div>
    </section>
  );
};
