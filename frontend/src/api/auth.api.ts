import type { LoginResponse } from "@/types/auth";
import api from "./axios";
import { mockLoginApi } from "./auth.mock.api";
import { API_CONFIG } from "@/api/api.config";

export const loginApi = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  // check config
  if (API_CONFIG.USE_MOCKS && API_CONFIG.MODULES.AUTH) {
    return mockLoginApi(email);
  }

  // real api
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  // normalize role to lowercase for frontend compatibility
  if (response.data?.user) {
    response.data.user.role = response.data.user.role.toLowerCase() as any;
  }

  return response.data;
};

export const registerUserApi = async (registerUserData: any) => {
  if (API_CONFIG.USE_MOCKS && API_CONFIG.MODULES.AUTH) {
    console.log("[Mock API] Registering user...", registerUserData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  await api.post("/auth/signup", {
    ...registerUserData,
    role: "USER",
  });
};

export const registerStaffApi = async (registerStaffData: any) => {
  if (API_CONFIG.USE_MOCKS && API_CONFIG.MODULES.AUTH) {
    console.log("[Mock API] Registering staff...", registerStaffData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  await api.post("/hospitals/register", registerStaffData);
};

export const getProfileApi = async (): Promise<any> => {
  if (API_CONFIG.USE_MOCKS) {
    return { name: "Mock Staff", phone: "+91-9999999999", status: "ACTIVE" };
  }
  const response = await api.get("/users/profile");
  return response.data;
};
