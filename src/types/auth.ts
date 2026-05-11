export interface LoginDto {
  email: string;
  username?: string;
  password: string;
  role?: string;
}

export interface RegisterDto {
  fullName: string;
  username?: string;
  phone?: string;
  email: string;
  password: string;
  role: 'customer' | 'admin'; // Restricting role for generic/customer register
}

export interface RegisterNurseDto {
  fullName: string;
  username?: string;
  phone?: string;
  email: string;
  password: string;
  bio?: string;
  yearsExperience: number;
  serviceRadiusKm: number;
}

export interface ExternalLoginDto {
  provider: string; 
  idToken: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: string;
  refreshToken: string;
}

export interface User {
  username: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
