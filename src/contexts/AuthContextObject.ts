import { createContext } from 'react';
import type { AuthState, User, LoginDto, RegisterDto, RegisterNurseDto, ExternalLoginDto } from '../types/auth';

export interface AuthContextType extends AuthState {
    login: (data: LoginDto) => Promise<User>;
    loginExternal: (data: ExternalLoginDto) => Promise<User>;
    register: (data: RegisterDto | RegisterNurseDto, role: string) => Promise<User>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
