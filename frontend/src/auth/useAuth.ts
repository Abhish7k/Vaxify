import { useAuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { loginApi, registerUserApi, registerStaffApi } from "@/api/auth.api";
import type { Role } from "@/types/auth";

// custom hook for the components to use
export const useAuth = () => {
  const navigate = useNavigate();
  const { user, setAuthUser } = useAuthContext();

  const registerUser = async (registerUserData: unknown) => {
    await registerUserApi(registerUserData);

    navigate("/login");
  };

  const registerStaff = async (registerStaffData: unknown) => {
    await registerStaffApi(registerStaffData);

    navigate("/login");
  };

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);

    const { token, user } = response;

    // persist the jwt token & user
    localStorage.setItem("token", token);
    localStorage.setItem("storedUser", JSON.stringify(user));

    // update the auth context with user
    setAuthUser(user);

    // role base redirect
    redirectToDashboard(user.role);
  };

  const logout = () => {
    // remove jwt token & user
    localStorage.removeItem("token");
    localStorage.removeItem("storedUser");

    // clear auth context
    setAuthUser(null);

    // redirect
    navigate(
      "/",
      { replace: true }, // replace history to prevent back btn to access protected pages
    );
  };

  const redirectToDashboard = (role: Role) => {
    const normalizedRole = role?.toLowerCase();

    switch (normalizedRole) {
      case "user":
        navigate("/dashboard");
        break;
      case "staff":
        navigate("/staff/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    registerUser,
    registerStaff,
  };
};
