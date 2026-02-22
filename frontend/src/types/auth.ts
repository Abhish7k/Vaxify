export type Role = "user" | "staff" | "admin";

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
  phone?: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
