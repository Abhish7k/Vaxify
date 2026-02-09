import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StaffDetailsStepProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const StaffDetailsStep = ({
  register,
  errors,
}: StaffDetailsStepProps) => {
  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-red-500">
              {errors.firstName.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-red-500">
              {errors.lastName.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-500">
            {errors.email.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input {...register("phone")} type="number" />
        {errors.phone && (
          <p className="text-sm text-red-500">
            {errors.phone.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message as string}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
