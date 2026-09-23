import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastUtils } from "@/lib/toast";
import { getErrorMessage, isConflictError, mapServerFieldErrors } from "@/lib/errors";
import {
  ADDRESS_MAX,
  ADDRESS_MAX_MESSAGE,
  CITY_MAX,
  CITY_MAX_MESSAGE,
  HOSPITAL_NAME_MAX,
  HOSPITAL_NAME_MAX_MESSAGE,
  NAME_MAX,
  passwordField,
  PHONE_MESSAGE,
  PHONE_REGEX,
  PINCODE_MESSAGE,
  PINCODE_REGEX,
  STAFF_NAME_MAX_MESSAGE,
  STATE_MAX,
  STATE_MAX_MESSAGE,
} from "@/lib/validation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/useAuth";
import { StaffDetailsStep } from "@/components/auth/StaffDetailsStep";
import { HospitalDetailsStep } from "@/components/auth/HospitalDetailsStep";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

const staffRegisterSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
    phone: z.string().regex(PHONE_REGEX, PHONE_MESSAGE),
    email: z.email("Enter a valid email address"),
    password: passwordField,
    confirmPassword: z.string(),
    hospitalName: z
      .string()
      .min(2, "Hospital name is required")
      .max(HOSPITAL_NAME_MAX, HOSPITAL_NAME_MAX_MESSAGE),
    hospitalAddress: z
      .string()
      .min(5, "Hospital address is required")
      .max(ADDRESS_MAX, ADDRESS_MAX_MESSAGE),
    city: z.string().min(2, "City is required").max(CITY_MAX, CITY_MAX_MESSAGE),
    state: z.string().min(2, "State is required").max(STATE_MAX, STATE_MAX_MESSAGE),
    pincode: z.string().regex(PINCODE_REGEX, PINCODE_MESSAGE),
    hospitalRegistrationId: z.string().min(3, "Hospital registration ID is required"),
    document: z.string().min(1, "Verification document is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => `${data.firstName} ${data.lastName}`.length <= NAME_MAX, {
    message: STAFF_NAME_MAX_MESSAGE,
    path: ["firstName"],
  });

type StaffRegisterForm = z.infer<typeof staffRegisterSchema>;

const staffApiFields: Record<string, keyof StaffRegisterForm> = {
  staffName: "firstName",
  email: "email",
  password: "password",
  phone: "phone",
  hospitalName: "hospitalName",
  hospitalAddress: "hospitalAddress",
  licenseNumber: "hospitalRegistrationId",
  document: "document",
  city: "city",
  state: "state",
  pincode: "pincode",
};

const staffStep1Fields = new Set<keyof StaffRegisterForm>([
  "firstName",
  "lastName",
  "phone",
  "email",
  "password",
  "confirmPassword",
]);

const RegisterStaffPage = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);
  const step1Attempted = useRef(false);
  const revalidateTimers = useRef<Partial<Record<keyof StaffRegisterForm, number>>>({});

  const { registerStaff } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    clearErrors,
    getValues,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<StaffRegisterForm>({
    resolver: zodResolver(staffRegisterSchema),
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

  useUnsavedChanges(isDirty && !isLoading && !allowLeave);

  // Next uses trigger(), which does not mark the form submitted, so onChange
  // revalidation never starts. After the first attempt, recheck the edited field.
  const registerStep1: typeof register = (name, options) =>
    register(name, {
      ...options,
      onChange: (event) => {
        void options?.onChange?.(event);
        if (!step1Attempted.current) return;

        const timers = revalidateTimers.current;
        window.clearTimeout(timers[name]);
        timers[name] = window.setTimeout(() => {
          void trigger(name);
          if (options?.deps) void trigger(options.deps);
        }, 0);
      },
    });

  const applyServerErrors = (fields: Record<string, string>) => {
    Object.entries(fields).forEach(([name, message], index) => {
      setError(
        name as keyof StaffRegisterForm,
        { type: "server", message },
        index === 0 ? { shouldFocus: true } : undefined,
      );
    });
  };

  const onNext = async () => {
    step1Attempted.current = true;
    const isStepValid = await trigger(
      ["firstName", "lastName", "phone", "email", "password", "confirmPassword"],
      { shouldFocus: true },
    );

    if (isStepValid && step === 1) {
      clearErrors();
      setStep(2);
    }
  };

  const onPrev = () => {
    setStep(1);
  };

  const onSubmit = async () => {
    if (step !== 2 || isUploading) {
      return;
    }

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

      setAllowLeave(true);
      await registerStaff(registerStaffPayload);

      toastUtils.success("Registration submitted for approval");
    } catch (error) {
      setAllowLeave(false);

      const message = getErrorMessage(error, "Staff Registration failed");
      const fieldErrors = isConflictError(error) ? null : mapServerFieldErrors(error, staffApiFields);
      const documentError =
        !fieldErrors && /verification document/i.test(message) ? { document: message } : null;
      const errorsToApply = fieldErrors ?? documentError;

      if (errorsToApply) {
        const needsStep1 = Object.keys(errorsToApply).some((field) =>
          staffStep1Fields.has(field as keyof StaffRegisterForm),
        );

        if (needsStep1 && step === 2) {
          setStep(1);
          window.setTimeout(() => applyServerErrors(errorsToApply), 0);
        } else {
          applyServerErrors(errorsToApply);
        }
      } else {
        toastUtils.error(message);
      }
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
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (step !== 2) {
              void onNext();
              return;
            }
            if (isUploading) return;
            void handleSubmit(onSubmit)(event);
          }}
          className="space-y-6"
        >
          {step === 1 && (
            <StaffDetailsStep register={registerStep1} errors={errors} />
          )}

          {step === 2 && (
            <HospitalDetailsStep
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              onUploadingChange={setIsUploading}
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
                <Button type="submit" className="w-full" size="lg">
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={isLoading || isUploading}
                >
                  {isLoading || isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoaderCircle className="animate-spin" />
                      {isUploading ? "Uploading..." : "Submitting..."}
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

export default RegisterStaffPage;
