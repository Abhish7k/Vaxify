import type { LoginResponse } from "@/types/auth";
import type { AuthResponseDto, SignupRequestDto } from "@/api/dto/auth";
import type { StaffHospitalRegistrationRequestDto } from "@/api/dto/hospital";
import { mapLoginResponse } from "@/api/mappers/auth";
import api from "./axios";

export const loginApi = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await api.post<AuthResponseDto>("/auth/login", {
    email,
    password,
  });

  return mapLoginResponse(response.data);
};

export const registerUserApi = async (registerUserData: SignupRequestDto) => {
  await api.post("/auth/signup", {
    ...registerUserData,
    role: "USER",
  });
};

export const registerStaffApi = async (
  registerStaffData: StaffHospitalRegistrationRequestDto,
) => {
  await api.post("/hospitals/register", registerStaffData);
};
