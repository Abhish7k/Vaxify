import { useAuthContext } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { loginApi, registerUserApi, registerStaffApi } from "@/api/auth.api";
import type { SignupRequestDto } from "@/api/dto/auth";
import type { StaffHospitalRegistrationRequestDto } from "@/api/dto/hospital";
import { clearSession, persistSession } from "@/lib/auth-session";
import { queryClient } from "@/lib/query-client";
import { getReturnToFromSearch, resolvePostLoginPath } from "@/lib/auth-paths";

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setAuthUser, loading, sessionError, retrySession } = useAuthContext();

  const registerUser = async (registerUserData: SignupRequestDto) => {
    await registerUserApi(registerUserData);

    navigate("/login");
  };

  const registerStaff = async (registerStaffData: StaffHospitalRegistrationRequestDto) => {
    await registerStaffApi(registerStaffData);

    navigate("/login");
  };

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);

    const { token, user: authUser } = response;

    persistSession(token, authUser);
    setAuthUser(authUser);

    const fromState = (location.state as { from?: string } | null)?.from;
    const returnTo = getReturnToFromSearch(location.search) ?? fromState ?? null;
    navigate(resolvePostLoginPath(authUser.role, returnTo), { replace: true });
  };

  const logout = () => {
    clearSession();
    queryClient.clear();
    setAuthUser(null);
    navigate("/", { replace: true });
  };

  return {
    user,
    loading,
    sessionError,
    retrySession,
    isAuthenticated: !!user,
    login,
    logout,
    registerUser,
    registerStaff,
  };
};
