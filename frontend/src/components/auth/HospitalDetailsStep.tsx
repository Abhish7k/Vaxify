import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HospitalDetailsStepProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export const HospitalDetailsStep = ({
  register,
  errors,
  setValue,
  watch,
}: HospitalDetailsStepProps) => {
  const documentUrl = watch("document");

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <Label htmlFor="hospitalName">Hospital Name</Label>
        <Input id="hospitalName" {...register("hospitalName")} />
        {errors.hospitalName && (
          <p className="text-sm text-red-500">
            {errors.hospitalName.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospitalAddress">Hospital Address</Label>
        <Input id="hospitalAddress" {...register("hospitalAddress")} />
        {errors.hospitalAddress && (
          <p className="text-sm text-red-500">
            {errors.hospitalAddress.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="e.g. Pune" />
          {errors.city && (
            <p className="text-sm text-red-500">
              {errors.city.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} placeholder="e.g. Maharashtra" />
          {errors.state && (
            <p className="text-sm text-red-500">
              {errors.state.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode</Label>
        <Input
          id="pincode"
          {...register("pincode")}
          placeholder="e.g. 411057"
          maxLength={6}
        />
        {errors.pincode && (
          <p className="text-sm text-red-500">
            {errors.pincode.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospitalRegistrationId">Hospital Registration ID</Label>
        <Input id="hospitalRegistrationId" {...register("hospitalRegistrationId")} />
        {errors.hospitalRegistrationId && (
          <p className="text-sm text-red-500">
            {errors.hospitalRegistrationId.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospital-document">Verification Document</Label>

        <FileDropzone
          id="hospital-document"
          value={documentUrl}
          onChange={(url, fileName) => {
            setValue("document", fileName || url || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />

        {errors.document && (
          <p className="text-sm text-red-500 mt-1">
            {errors.document.message as string}
          </p>
        )}
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
