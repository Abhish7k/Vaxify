import type { LoginResponse } from "@/types/auth";
import api from "./axios";
import { mockLoginApi } from "./auth.mock.api";
import { API_CONFIG } from "@/api/api.config";

export const loginApi = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  // check config
  if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.AUTH) {
    return mockLoginApi(email);
  }

  // real api
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerUserApi = async (registerUserData: unknown) => {
  if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.AUTH) {
    console.log("[Mock API] Registering user...", registerUserData);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return;
  }

  await api.post("/auth/register/user", registerUserData);
};

export const registerStaffApi = async (registerStaffData: unknown) => {
  if (API_CONFIG.USE_MOCKS || API_CONFIG.MODULES.AUTH) {
    console.log("[Mock API] Registering staff...", registerStaffData);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return;
  }

  await api.post("/auth/register/staff", registerStaffData);
};
