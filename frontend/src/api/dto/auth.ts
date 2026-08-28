export interface AuthUserDto {
  id: number;
  name?: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponseDto {
  token: string;
  user: AuthUserDto;
}

export interface SignupRequestDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}
