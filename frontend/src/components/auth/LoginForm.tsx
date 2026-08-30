import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordInput from "./PasswordInput";
import { useAuth } from "@/auth/useAuth";
import QuickDemoLogins from "./QuickDemoLogins";
import { toastUtils } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import axios from "axios";

// zod schema
const signInSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInSchemaType = z.infer<typeof signInSchema>;

const showDemoLogin =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true";

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (formData: SignInSchemaType) => {
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);

      toastUtils.success("Logged in successfully");
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.status === 401
          ? "Invalid email or password"
          : getErrorMessage(error, "Invalid credentials. Please try again.");

      toastUtils.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>

        <CardDescription>Enter your credentials below to login to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full"
              {...register("email")}
            />

            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <PasswordInput id="password" className="w-full" {...register("password")} />

            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {/* submit button */}
          <Button
            type="submit"
            className="w-full cursor-pointer transition-all"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin size-4" />
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>

          {showDemoLogin && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <QuickDemoLogins
                onDemoClick={() => {
                  setValue("email", "user@test.com", { shouldValidate: true });
                  setValue("password", "password", { shouldValidate: true });
                }}
              />
            </>
          )}
        </form>
      </CardContent>

      <CardFooter className="pt-2 flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account ?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
