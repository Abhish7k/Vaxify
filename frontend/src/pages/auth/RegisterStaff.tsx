import { useState, useEffect } from "react";
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

// step 1 schema - staff only
const step1Schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),

    phone: z
      .string().min(10, "Enter a valid phone number").max(10, "Enter a valid phone number"),
    email: z.email("Enter a valid email address"),

    password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// step 2 schema - hospital only
const step2Schema = z.object({
  hospitalName: z.string().min(2, "Hospital name is required"),
  hospitalAddress: z.string().min(5, "Hospital address is required"),

  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Enter a valid 6-digit pincode"),

  hospitalRegistrationId: z.string().min(3, "Hospital registration ID is required"),

  document: z.string().min(1, "Verification document is required"),
});

// for form state 
type StaffRegisterForm = z.infer<typeof step1Schema> & z.infer<typeof step2Schema>;

const RegisterStaff = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { registerStaff } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    clearErrors,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffRegisterForm>({
    resolver: zodResolver(step === 1 ? step1Schema : step2Schema) as any,
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      hospitalName: "",
      hospitalAddress: "",
      city: "",
      state: "",
      pincode: "",
      hospitalRegistrationId: "",
      document: "",
    },
  });

  // clear errors on step change to ensure no premature messages
  useEffect(() => {
    // we clear errors and reset validation state so step 2 starts clean
    clearErrors();
  }, [step, clearErrors]);


  const onNext = async () => {
    // validate only the current step (using the active schema)
    const isStepValid = await trigger();

    if (isStepValid) {
      if (step === 1) {
        // using setTimeout to move to next step ensures components mount 
        // before clearing errors, effectively hiding premature messages
        setTimeout(() => {
          setStep(2);
        }, 10);
      }
    }
  };

  const onPrev = () => {
    setStep(1);
  };

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      // combine data from all fields across steps
      const data = getValues();

      const {
        firstName,
        lastName,
        phone,
        email,
        password,
        hospitalName,
        hospitalAddress,
        city,
        state,
        pincode,
        hospitalRegistrationId,
        document,
      } = data;

      const registerStaffPayload = {
        staffName: `${firstName} ${lastName}`,
        email,
        password,
        phone,
        hospitalName,
        hospitalAddress,
        city,
        state,
        pincode,
        licenseNumber: hospitalRegistrationId,
        document,
      };

      await registerStaff(registerStaffPayload);

      toast.success("Registration submitted for approval", {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Staff Registration failed";

      toast.error(errorMessage, {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });

      console.log("register staff failed with error: ", error);
    } finally {

      await new Promise((resolve) => setTimeout(resolve, 400));

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
        <div className="flex justify-center gap-2 mt-2">
          <div
            className={`h-1 w-12 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"
              }`}
          />
          <div
            className={`h-1 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"
              }`}
          />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <StaffDetailsStep register={register} errors={errors} />
          )}

          {step === 2 && (
            <HospitalDetailsStep
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          )}

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
