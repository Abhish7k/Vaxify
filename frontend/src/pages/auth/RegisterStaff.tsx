import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from "@/auth/useAuth";
import { StaffDetailsStep } from "@/components/auth/StaffDetailsStep";
import { HospitalDetailsStep } from "@/components/auth/HospitalDetailsStep";

// staff details schema
const step1Schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),

    phone: z
      .string()
      .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian phone number"),

    email: z.email("Enter a valid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// hospital details schema
// we repeat staff fields here because step 2 is the final step.
// when the user submits the form on step 2, we want to validate everything
const step2Schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),

    phone: z
      .string()
      .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian phone number"),

    email: z.email("Enter a valid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),

    hospitalName: z.string().min(2, "Hospital name is required"),

    hospitalAddress: z.string().min(5, "Hospital address is required"),

    hospitalRegistrationId: z
      .string()
      .min(3, "Hospital registration ID is required"),

    document: z
      .any()
      .refine(
        (files) => files?.length >= 1,
        "Verification document is required",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type StaffRegisterForm = z.infer<typeof step2Schema>;

const RegisterStaff = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { registerStaff } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<StaffRegisterForm>({
    // we want switch the validation schema based on the current step
    // - if on step 1, we only check staff details step1Schema
    // - if on step 2, we check everything step2Schema

    resolver: zodResolver(step === 1 ? step1Schema : step2Schema) as any,
    mode: "onSubmit",
  });

  const onNext = async () => {
    // we strictly validate only the fields present in step 1
    // trigger returns true if these fields are valid, allowing us to proceed
    // if we didn't do this, the user could skip step 1 without entering data

    const step1Fields: (keyof StaffRegisterForm)[] = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];

    const isStep1Valid = await trigger(step1Fields);

    if (isStep1Valid) {
      setStep(2);
    }
  };

  const onPrev = () => {
    setStep(1);
  };

  // on submit func
  const onSubmit = async (data: StaffRegisterForm) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      // destructure data to format it for the backend api
      const {
        firstName,
        lastName,
        phone,
        email,
        password,
        hospitalName,
        hospitalAddress,
        hospitalRegistrationId,
      } = data;

      // payload to match the expected api structure
      const registerStaffPayload = {
        user: {
          firstName,
          lastName,
          email,
          phone,
          password,
        },
        hospital: {
          name: hospitalName,
          address: hospitalAddress,
          registrationId: hospitalRegistrationId,
        },
      };

      await registerStaff(registerStaffPayload);

      toast.success("Registration submitted for approval");
    } catch (error) {
      toast.error("Staff Registration failed");
      console.log("register staff failed with error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          Hospital Staff Registration
        </CardTitle>

        <p className="text-sm text-center text-muted-foreground">
          Step {step} of 2: {step === 1 ? "Staff Details" : "Hospital Details"}
        </p>

        {/* progress indicator */}
        <div className="flex justify-center gap-2 mt-2">
          <div
            className={`h-1 w-12 rounded-full transition-colors ${
              step >= 1 ? "bg-primary" : "bg-muted"
            }`}
          />
          <div
            className={`h-1 w-12 rounded-full transition-colors ${
              step >= 2 ? "bg-primary" : "bg-muted"
            }`}
          />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* step 1 - staff details */}
          {step === 1 && (
            <StaffDetailsStep register={register} errors={errors} />
          )}

          {/* step 2 - hospital details */}
          {step === 2 && (
            <HospitalDetailsStep register={register} errors={errors} />
          )}

          {/* actions */}
          <div className="space-y-4 pt-4">
            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrev}
                  className="w-1/3"
                >
                  Back
                </Button>
              )}

              {step === 1 ? (
                <Button
                  type="button"
                  onClick={onNext}
                  className="w-full"
                  size="lg"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoaderCircle className="animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterStaff;
