import type { LoginResponse } from "@/types/auth";
import api from "./axios";

export const loginApi = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
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
  await api.post("/auth/signup", {
    ...registerUserData,
    role: "USER",
  });
};

export const registerStaffApi = async (registerStaffData: any) => {
  await api.post("/hospitals/register", registerStaffData);
};

export const getProfileApi = async (): Promise<any> => {
  const response = await api.get("/users/profile");
  return response.data;
};
