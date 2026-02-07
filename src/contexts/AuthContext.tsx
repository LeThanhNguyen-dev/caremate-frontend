import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState, LoginDto, RegisterDto, RegisterNurseDto, TokenResponse, ExternalLoginDto } from '../types/auth';
import authApi from '../api/authApi';

interface AuthContextType extends AuthState {
    login: (data: LoginDto) => Promise<void>;
    loginExternal: (data: ExternalLoginDto) => Promise<void>;
    register: (data: RegisterDto | RegisterNurseDto, role: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        if (accessToken && refreshToken && userStr) {
            try {
                const user = JSON.parse(userStr) as User;
                setState({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const handleAuthResponse = (response: TokenResponse) => {
        const user: User = {
            username: response.username,
            email: '', // Backend doesn't return email in token response
            role: response.role,
        };

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setState({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const login = async (data: LoginDto) => {
        const response = await authApi.login(data);
        handleAuthResponse(response);
    };

    const loginExternal = async (data: ExternalLoginDto) => {
        const response = await authApi.externalLogin(data);
        handleAuthResponse(response);
    };

    const register = async (data: RegisterDto | RegisterNurseDto, role: string) => {
        let response: TokenResponse;
        if (role === 'nurse') {
            response = await authApi.registerNurse(data as RegisterNurseDto);
        } else {
            response = await authApi.registerCustomer(data as RegisterDto);
        }
        handleAuthResponse(response);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, loginExternal, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
