import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toastUtils } from "@/lib/toast";
import { fieldErrorAria, getErrorMessage, isConflictError, mapServerFieldErrors } from "@/lib/errors";
import {
  NAME_MAX,
  NAME_MAX_MESSAGE,
  passwordField,
  PHONE_MESSAGE,
  PHONE_REGEX,
} from "@/lib/validation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

const userRegisterSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),

    phone: z.string().regex(PHONE_REGEX, PHONE_MESSAGE),

    email: z.email("Enter a valid email"),

    password: passwordField,

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => `${data.firstName} ${data.lastName}`.length <= NAME_MAX, {
    message: NAME_MAX_MESSAGE,
    path: ["firstName"],
  });

type UserRegisterForm = z.infer<typeof userRegisterSchema>;

const userApiFields: Record<string, keyof UserRegisterForm> = {
  name: "firstName",
  email: "email",
  password: "password",
  phone: "phone",
};

const RegisterUserPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allowLeave, setAllowLeave] = useState(false);

  const { registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<UserRegisterForm>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useUnsavedChanges(isDirty && !isLoading && !allowLeave);

  const onSubmit = async (formData: UserRegisterForm) => {
    setIsLoading(true);

    try {
      const { confirmPassword, firstName, lastName, ...rest } = formData;
      const registerData = {
        ...rest,
        name: `${firstName} ${lastName}`,
      };

      setAllowLeave(true);
      await registerUser(registerData);

      toastUtils.success("Registered successfully");
    } catch (error) {
      setAllowLeave(false);

      const fieldErrors = isConflictError(error) ? null : mapServerFieldErrors(error, userApiFields);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([name, message], index) => {
          setError(
            name as keyof UserRegisterForm,
            { type: "server", message },
            index === 0 ? { shouldFocus: true } : undefined,
          );
        });
      } else {
        toastUtils.error(getErrorMessage(error, "Register failed. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="my-10">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-center">Register as User</CardTitle>

        <p className="text-sm text-center text-muted-foreground">
          Create an account to book vaccination appointments
        </p>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>

              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName")}
                {...fieldErrorAria("firstName", Boolean(errors.firstName))}
              />

              {errors.firstName && (
                <p id="firstName-error" className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>

              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName", { deps: "firstName" })}
                {...fieldErrorAria("lastName", Boolean(errors.lastName))}
              />

              {errors.lastName && (
                <p id="lastName-error" className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              {...fieldErrorAria("email", Boolean(errors.email))}
            />

            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>

            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              {...register("phone")}
              {...fieldErrorAria("phone", Boolean(errors.phone))}
            />

            {errors.phone && (
              <p id="phone-error" className="text-sm text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              maxLength={20}
              placeholder="••••••••"
              {...register("password", { deps: "confirmPassword" })}
              {...fieldErrorAria("password", Boolean(errors.password))}
            />

            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>

            <Input
              id="confirmPassword"
              type="password"
              maxLength={20}
              placeholder="••••••••"
              {...register("confirmPassword")}
              {...fieldErrorAria("confirmPassword", Boolean(errors.confirmPassword))}
            />

            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full cursor-pointer" size="lg" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterUserPage;
