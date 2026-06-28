import { useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState, LoginDto, RegisterDto, RegisterNurseDto, TokenResponse, ExternalLoginDto } from '../types/auth';
import authApi from '../api/authApi';
import { AuthContext } from './AuthContextObject';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const persistUser = (user: User, tokens?: { accessToken: string; refreshToken: string }) => {
        if (tokens) {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
    };

    const parseUserId = (value: string | number | null | undefined): number | null => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (!value) return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    };

    useEffect(() => {
        const bootstrap = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const userStr = localStorage.getItem('user');

            if (!accessToken || !refreshToken || !userStr) {
                setState((prev) => ({ ...prev, isLoading: false }));
                return;
            }

            try {
                const cachedUser = JSON.parse(userStr) as User;
                setState({
                    user: cachedUser,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });

                const me = await authApi.getCurrentUser();
                const hydratedUser: User = {
                    userId: parseUserId(me.userId) ?? cachedUser.userId ?? null,
                    username: me.fullName || cachedUser.username,
                    email: me.email || cachedUser.email,
                    role: me.role || cachedUser.role,
                };

                persistUser(hydratedUser);
                setState((prev) => ({ ...prev, user: hydratedUser }));
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };
        void bootstrap();
    }, []);

    const handleAuthResponse = async (
        response: TokenResponse & Partial<{ token: string; fullName: string; email: string }>,
    ): Promise<User> => {
        // Hỗ trợ cả accessToken và token (tùy backend)
        const accessToken = response.accessToken || response.token;
        const refreshToken = response.refreshToken;
        
        let user: User = {
            userId: null,
            username: response.username || response.fullName || response.email || 'User',
            email: response.email || '',
            role: response.role || 'customer',
        };

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        try {
            const me = await authApi.getCurrentUser();
            user = {
                userId: parseUserId(me.userId),
                username: me.fullName || user.username,
                email: me.email || user.email,
                role: me.role || user.role,
            };
        } catch (error) {
            console.error('Hydration error:', error);
        }

        persistUser(user, { 
            accessToken: accessToken || '', 
            refreshToken: refreshToken || '' 
        });

        setState({
            user,
            accessToken: accessToken || null,
            refreshToken: refreshToken || null,
            isAuthenticated: !!accessToken,
            isLoading: false,
        });

        return user;
    };

    const login = async (data: LoginDto) => {
        const response = await authApi.login(data);
        return await handleAuthResponse(response);
    };

    const loginExternal = async (data: ExternalLoginDto) => {
        const response = await authApi.externalLogin(data);
        return await handleAuthResponse(response);
    };

    const register = async (data: RegisterDto | RegisterNurseDto, role: string) => {
        if (role === 'nurse') {
            await authApi.registerNurse(data as RegisterNurseDto);
        } else {
            await authApi.registerCustomer(data as RegisterDto);
        }
    };

    const logout = async () => {
        // Revoke refresh token server-side first
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await authApi.logout(refreshToken);
            } catch {
                // Best-effort: if server call fails, still clear local state
                console.warn('Server-side logout failed, clearing local state anyway');
            }
        }

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
