import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div>
      <div className="text-center mb-8 pt-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>

        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      <LoginForm />
    </div>
  );
};

export default LoginPage;
