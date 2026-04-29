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
};

export default authApi;
