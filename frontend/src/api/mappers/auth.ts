import type { AuthResponseDto } from "@/api/dto/auth";
import type { AuthUser, LoginResponse } from "@/types/auth";
import { toRole } from "@/types/auth";

export function mapAuthUser(dto: AuthResponseDto["user"]): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    role: toRole(dto.role),
    name: dto.name,
    createdAt: dto.createdAt,
  };
}

export function mapLoginResponse(dto: AuthResponseDto): LoginResponse {
  return {
    token: dto.token,
    user: mapAuthUser(dto.user),
  };
}
