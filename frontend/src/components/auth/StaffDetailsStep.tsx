import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldErrorAria } from "@/lib/errors";
import { PASSWORD_MAX } from "@/lib/validation";

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
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            {...fieldErrorAria("firstName", Boolean(errors.firstName))}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-sm text-red-500">
              {errors.firstName.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...register("lastName", { deps: "firstName" })}
            {...fieldErrorAria("lastName", Boolean(errors.lastName))}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-sm text-red-500">
              {errors.lastName.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          {...fieldErrorAria("email", Boolean(errors.email))}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500">
            {errors.email.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...register("phone")}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          {...fieldErrorAria("phone", Boolean(errors.phone))}
        />
        {errors.phone && (
          <p id="phone-error" className="text-sm text-red-500">
            {errors.phone.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            maxLength={PASSWORD_MAX}
            {...register("password", { deps: "confirmPassword" })}
            {...fieldErrorAria("password", Boolean(errors.password))}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-red-500">
              {errors.password.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            maxLength={PASSWORD_MAX}
            {...register("confirmPassword")}
            {...fieldErrorAria("confirmPassword", Boolean(errors.confirmPassword))}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-red-500">
              {errors.confirmPassword.message as string}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
