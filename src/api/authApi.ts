import axiosInstance from './axios';
import type { LoginDto, RegisterDto, RegisterNurseDto, TokenResponse, ExternalLoginDto } from '../types/auth';
import type { MeResponse } from './frontend-api-contract';

export const authApi = {
    login: async (data: LoginDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/auth/login', data);
        return response.data;
    },

    externalLogin: async (data: ExternalLoginDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/auth/login/external', data);
        return response.data;
    },

    registerCustomer: async (data: RegisterDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/auth/signup/customer', data);
        return response.data;
    },

    registerNurse: async (data: RegisterNurseDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/auth/signup/nurse', data);
        return response.data;
    },

    refreshToken: async (accessToken: string, refreshToken: string): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/auth/refresh-token', {
            accessToken,
            refreshToken,
        });
        return response.data;
    },

    getCurrentUser: async (): Promise<MeResponse> => {
        const response = await axiosInstance.get<MeResponse>('/api/auth/me');
        return response.data;
    },

    /** POST /api/Auth/logout — Revoke refresh token server-side */
    logout: async (refreshToken: string): Promise<void> => {
        await axiosInstance.post('/api/auth/logout', { refreshToken });
    },

    /** PATCH /api/Auth/change-password */
    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
        await axiosInstance.patch('/api/auth/change-password', data);
    },

    /** POST /api/Auth/forgot-password */
    forgotPassword: async (email: string): Promise<void> => {
        await axiosInstance.post('/api/auth/forgot-password', { email });
    },

    /** POST /api/Auth/reset-password */
    resetPassword: async (data: { email: string; token: string; newPassword: string }): Promise<void> => {
        await axiosInstance.post('/api/auth/reset-password', data);
    },
};

export default authApi;
